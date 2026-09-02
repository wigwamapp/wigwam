import BigNumber from "bignumber.js";
import memoize from "mem";
import { props } from "lib/system/promise";

import { AccountAsset, Network, TokenStatus, TokenType } from "core/types";
import {
  createAccountTokenKey,
  getNativeTokenLogoUrl,
  NATIVE_TOKEN_SLUG,
} from "core/common/tokens";
import { getNetwork, isNetworkWithEthToken } from "core/common/network";
import * as repo from "core/repo";

import { getNativeTokenPrice } from "../dexPrices";
import { getBalanceFromChain } from "../chain";

/**
 * Chains probed on the very first sync of an account. Long-lived networks
 * where an untouched wallet is most likely to hold something, so a fresh
 * install shows a balance without the user opening each one by hand.
 *
 * Only probed once: from then on the tracked set is whatever came back
 * non-empty (see {@link syncNetworks}).
 */
export const INITIAL_SYNC_CHAIN_IDS = [
  1, // ethereum
  137, // polygon
  56, // bsc
  8453, // base
  42161, // arbitrum
  10, // optimism
  43114, // avalanche
  59144, // linea
];

/**
 * Native token sync.
 *
 * The first run for an account probes {@link INITIAL_SYNC_CHAIN_IDS} and keeps
 * only the chains that came back with a balance. Every run after that refreshes
 * that remembered set plus the active chain — the whitelist is never walked
 * again. A chain drops out of the set as soon as its balance is confirmed zero,
 * and a chain the user opens by hand joins it as soon as it syncs non-zero.
 *
 * The active chain is always synced and always kept, even at zero balance, so
 * the UI has a native token to render for the network being viewed. Syncing
 * never switches the active network — that is the user's choice alone.
 *
 * Strictly the native token: a full token list costs an explorer request per
 * chain, so those are synced for the active chain alone.
 */
export const syncNetworks = memoize(
  async (accountAddress: string, activeChainId: number) => {
    const [existingNativeTokens, allNetworks] = await Promise.all([
      repo.accountTokens
        .where("[accountAddress+tokenSlug]")
        .equals([accountAddress, NATIVE_TOKEN_SLUG])
        .toArray(),
      repo.networks.toArray().catch((err) => {
        console.error(err);
        return [];
      }),
    ]);

    // Native tokens are always assets, never NFTs
    const existingTokensMap = new Map(
      existingNativeTokens.map((t) => [t.chainId, t as AccountAsset]),
    );

    const knownChainIds = new Set(allNetworks.map((n) => n.chainId));

    const firstSync = existingNativeTokens.length === 0;

    const chainIds = new Set([
      ...(firstSync
        ? INITIAL_SYNC_CHAIN_IDS.filter((id) => knownChainIds.has(id))
        : // Empty chains are pruned below, so a stored chain is one the account
          // is known to hold something on
          existingNativeTokens.filter(worthKeeping).map((t) => t.chainId)),
      activeChainId,
    ]);

    const networks: Network[] = [];
    for (const chainId of chainIds) {
      try {
        networks.push(await getNetwork(chainId));
      } catch (err) {
        console.warn("Unlisted network founded", chainId, err);
      }
    }

    const keyFor = (chainId: number) =>
      createAccountTokenKey({
        chainId,
        accountAddress,
        tokenSlug: NATIVE_TOKEN_SLUG,
      });

    const data = await Promise.all(
      networks.map((network) => {
        const { chainId } = network;
        const isETHToken = isNetworkWithEthToken(network);

        return props({
          chainId,
          balance: getBalanceFromChain(
            chainId,
            NATIVE_TOKEN_SLUG,
            accountAddress,
          ).catch(() => null),
          cgPrice: getNativeTokenPrice(isETHToken ? 1 : chainId),
        });
      }),
    );

    // The whitelist is walked once, so a run that reached nothing (browser
    // started before the network was up) must not count as that one walk:
    // leaving the repo untouched keeps the account on the first-sync path
    if (firstSync && data.every(({ balance }) => balance === null)) return;

    const records: AccountAsset[] = [];
    const dbKeys: string[] = [];

    // Leftovers from a previous run: stored, yet neither held nor active.
    // Anything worth keeping is part of `chainIds` by construction
    const dbKeysToDelete = existingNativeTokens
      .filter((t) => !chainIds.has(t.chainId))
      .map((t) => keyFor(t.chainId));

    const buildRecord = (network: Network, i: number): AccountAsset => {
      const { chainId, nativeCurrency, chainTag } = network;
      const { balance, cgPrice } = data[i];
      const existing = existingTokensMap.get(chainId);

      const priceUSD = cgPrice?.usd?.toString();
      const priceUSDChange = cgPrice?.usd_24h_change?.toString();

      // Portfolio value is recalculated from the repo by refreshTotalBalances
      // for the active chain, the rest keep whatever was stored
      const portfolioUSD = existing?.portfolioUSD || "0";

      const metadata = {
        decimals: nativeCurrency.decimals,
        name: nativeCurrency.name,
        symbol: nativeCurrency.symbol,
        logoUrl: getNativeTokenLogoUrl(chainTag),
      };

      if (existing) {
        if (balance === null) {
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
    };

    networks.forEach((network, i) => {
      const { chainId } = network;
      const record = buildRecord(network, i);

      // A failed balance request leaves `rawBalance` as stored, so an RPC
      // hiccup never prunes a chain — only a confirmed zero does
      if (chainId === activeChainId || worthKeeping(record)) {
        records.push(record);
        dbKeys.push(keyFor(chainId));
      } else if (existingTokensMap.has(chainId)) {
        dbKeysToDelete.push(keyFor(chainId));
      }
    });

    await repo.accountTokens.bulkPut(records, dbKeys);

    if (dbKeysToDelete.length > 0) {
      await repo.accountTokens.bulkDelete(dbKeysToDelete).catch(console.error);
    }
  },
  {
    maxAge: 10_000, // 10 sec
    cacheKey: (args) => args.join(),
  },
);

/**
 * Whether a chain earns its place in the synced set. Native coin on it is the
 * main signal; a non-zero portfolio keeps chains where the value sits in tokens
 * rather than in the native coin (gas spent to the last drop, funds in USDC).
 */
function worthKeeping({
  rawBalance,
  portfolioUSD,
}: Pick<AccountAsset, "rawBalance" | "portfolioUSD">) {
  return isPositive(rawBalance) || isPositive(portfolioUSD);
}

function isPositive(value?: string | null) {
  return Boolean(value) && new BigNumber(value!).isGreaterThan(0);
}
