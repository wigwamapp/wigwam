import BigNumber from "bignumber.js";
import memoize from "mem";
import axios from "axios";
import { withOfflineCache } from "lib/ext/offlineCache";
import { props } from "lib/system/promise";

import { TokenStatus, TokenType } from "core/types";
import {
  createAccountTokenKey,
  getNativeTokenLogoUrl,
  NATIVE_TOKEN_SLUG,
} from "core/common/tokens";
import { getNetwork } from "core/common/network";
import * as repo from "core/repo";

import { getCoinGeckoNativeTokenPrice } from "../dexPrices";
import { getBalanceFromChain } from "../chain";
import { indexerApi } from "../indexer";
import { fetchTotalChainBalance } from "./total";

export const syncNetworks = memoize(
  async (accountAddress: string, activeChainId: number) => {
    const [existingNativeTokens, allUsedNetworks] = await Promise.all([
      repo.accountTokens
        .where("[accountAddress+tokenSlug]")
        .equals([accountAddress, NATIVE_TOKEN_SLUG])
        .toArray(),
      fetchAllUsedNetworks(accountAddress).catch((err) => {
        console.error(err);
        return [];
      }),
    ]);

    const existingTokensMap = new Map(
      existingNativeTokens.map((t) => [t.chainId, t]),
    );
    const chainIdsToRefresh = existingNativeTokens
      .filter(
        (t) => t.portfolioUSD && new BigNumber(t.portfolioUSD).isGreaterThan(0),
      )
      .map((t) => t.chainId);

    const chainIdsToAdd = allUsedNetworks.filter(
      (chainId) => !chainIdsToRefresh.includes(chainId),
    );

    const chainIds = new Set([
      ...chainIdsToRefresh,
      ...chainIdsToAdd,
      activeChainId,
    ]);

    const networks = [];
    for (const chainId of chainIds) {
      try {
        networks.push(await getNetwork(chainId));
      } catch (err) {
        console.warn("Unlisted network founded", chainId, err);
      }
    }

    const dbKeys = networks.map(({ chainId }) =>
      createAccountTokenKey({
        chainId,
        accountAddress,
        tokenSlug: NATIVE_TOKEN_SLUG,
      }),
    );

    const data = await Promise.all(
      networks.map((network) => {
        const { chainId, nativeCurrency, type } = network;
        const existing = existingTokensMap.get(chainId);

        const refreshNativeBalance = !existing || chainId === activeChainId;

        const noTotal =
          existing?.portfolioRefreshedAt &&
          existing.portfolioRefreshedAt > Date.now() - 24 * 60 * 60_000;

        const isETHToken =
          type !== "testnet" && nativeCurrency.symbol === "ETH";

        return props({
          chainId,
          balance: refreshNativeBalance
            ? getBalanceFromChain(chainId, NATIVE_TOKEN_SLUG, accountAddress)
            : null,
          cgPrice: getCoinGeckoNativeTokenPrice(isETHToken ? 1 : chainId),
          totalBalance: noTotal
            ? null
            : fetchTotalChainBalance(chainId, accountAddress).catch(() => null),
        });
      }),
    );

    await repo.accountTokens.bulkPut(
      networks.map((network, i) => {
        const { chainId, nativeCurrency, chainTag } = network;
        const { balance, cgPrice, totalBalance } = data[i];
        const existing = existingTokensMap.get(chainId);

        const priceUSD = cgPrice?.usd?.toString();
        const priceUSDChange = cgPrice?.usd_24h_change?.toString();

        const portfolioUSD = totalBalance || existing?.portfolioUSD || "0";

        const metadata = {
          decimals: nativeCurrency.decimals,
          name: nativeCurrency.name,
          symbol: nativeCurrency.symbol,
          logoUrl: getNativeTokenLogoUrl(chainTag),
        };

        if (existing) {
          if (!balance) {
            return {
              ...existing,
              priceUSD,
              priceUSDChange,
              portfolioUSD,
            };
          }

          const rawBalance = balance.toString();
          const balanceUSD = priceUSD
            ? new BigNumber(rawBalance)
                .div(new BigNumber(10).pow(nativeCurrency.decimals))
                .times(priceUSD)
                .toNumber()
            : existing.balanceUSD;

          return {
            ...existing,
            ...metadata,
            rawBalance,
            balanceUSD,
            priceUSD,
            priceUSDChange,
            portfolioUSD,
          };
        } else {
          const rawBalance = balance?.toString() ?? "0";
          const balanceUSD =
            balance && priceUSD
              ? new BigNumber(rawBalance)
                  .div(new BigNumber(10).pow(nativeCurrency.decimals))
                  .times(priceUSD)
                  .toNumber()
              : 0;

          return {
            chainId,
            accountAddress,
            tokenType: TokenType.Asset,
            status: TokenStatus.Native,
            tokenSlug: NATIVE_TOKEN_SLUG,
            ...metadata,
            rawBalance,
            balanceUSD,
            priceUSD,
            priceUSDChange,
            portfolioUSD,
          };
        }
      }),
      dbKeys,
    );

    // First time sync
    if (existingNativeTokens.length === 0) {
      const mostValuedItem = findWithMaxValue(
        data,
        (prev, next) =>
          !prev?.totalBalance ||
          (next.totalBalance
            ? new BigNumber(next.totalBalance).isGreaterThan(prev.totalBalance)
            : undefined),
      );

      if (mostValuedItem) return mostValuedItem?.chainId;
    }

    return;
  },
  {
    maxAge: 10_000, // 10 sec
    cacheKey: (args) => args.join(),
  },
);

export async function isFirstSync(accountAddress: string) {
  const anyNativeToken = await repo.accountTokens
    .where("[accountAddress+tokenSlug]")
    .equals([accountAddress, NATIVE_TOKEN_SLUG])
    .first();

  return Boolean(anyNativeToken);
}

export const fetchAllUsedNetworks = withOfflineCache(
  async (accountAddress: string) => {
    const data = await axios
      .get<{
        chains: { chainId: number }[];
      }>(`https://api.llamafolio.com/balances/${accountAddress}/tokens`)
      .then((r) => r.data)
      .catch(() => null);

    if (!data) {
      const res = await indexerApi.get(
        `/c/v1/address/${accountAddress}/activity/`,
        {
          params: {
            _authAddress: accountAddress,
          },
        },
      );

      const resItems = res.data?.data?.items ?? [];
      const chainIds: number[] = resItems.map((item: any) => +item.chain_id);

      return chainIds;
    }

    return data.chains.map((c) => c.chainId);
  },
  {
    key: ([address]) => `networks_${address}`,
    hotMaxAge: 30_000, // 30 sec
    coldMaxAge: 20_000 * 30, // 20 min
  },
);

function findWithMaxValue<T>(
  items: T[],
  compare: (prev: T | undefined, next: T) => boolean | undefined,
) {
  let mostVeluedItem: T | undefined;

  for (const item of items) {
    if (!mostVeluedItem || compare(mostVeluedItem, item)) {
      mostVeluedItem = item;
    }
  }

  return mostVeluedItem;
}
