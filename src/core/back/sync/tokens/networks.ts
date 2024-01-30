import BigNumber from "bignumber.js";
import memoize from "mem";
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
  async (accountAddress: string) => {
    const [existingNativeTokens, allUsedNetworks] = await Promise.all([
      repo.accountTokens
        .where("[accountAddress+tokenSlug]")
        .equals([accountAddress, NATIVE_TOKEN_SLUG])
        .toArray(),
      fetchAllUsedNetworks(accountAddress),
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

    const chainIds = [...chainIdsToRefresh, ...chainIdsToAdd];

    const dbKeys = chainIds.map((chainId) =>
      createAccountTokenKey({
        chainId,
        accountAddress,
        tokenSlug: NATIVE_TOKEN_SLUG,
      }),
    );

    const data = await Promise.all(
      chainIds.map((chainId) => {
        const existing = existingTokensMap.get(chainId);
        const noTotal =
          existing?.portfolioRefreshedAt &&
          existing.portfolioRefreshedAt > Date.now() - 5 * 60_000;

        return props({
          chainId,
          network: getNetwork(chainId),
          balance: getBalanceFromChain(
            chainId,
            NATIVE_TOKEN_SLUG,
            accountAddress,
          ),
          cgPrice: getCoinGeckoNativeTokenPrice(chainId),
          totalBalance: noTotal
            ? null
            : fetchTotalChainBalance(chainId, accountAddress).catch(() => null),
        });
      }),
    );

    await repo.accountTokens.bulkPut(
      chainIds.map((chainId, i) => {
        const { network, balance, cgPrice, totalBalance } = data[i];
        const existing = existingTokensMap.get(chainId);
        const { nativeCurrency, chainTag } = network;

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

      if (mostValuedItem) return mostValuedItem.chainId;
    }

    return;
  },
  {
    maxAge: 20_000, // 20 sec
  },
);

export const fetchAllUsedNetworks = withOfflineCache(
  async (accountAddress: string) => {
    const res = await indexerApi.get(
      `/c/v1/address/${accountAddress}/activity/`,
      {
        params: {
          _authAddress: accountAddress,
        },
      },
    );

    const resItems = res.data?.items ?? [];
    const chainIds: number[] = resItems.map((item: any) => +item.chainId);

    return chainIds;
  },
  {
    key: ([address]) => `used_networks_${address}`,
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
