import BigNumber from "bignumber.js";
import memoize from "mem";
import { getAddress } from "ethers";
import { withOfflineCache } from "lib/ext/offlineCache";

import { AccountToken, TokenStatus, TokenType } from "core/types";
import * as repo from "core/repo";
import {
  updateTotalBalance,
  createAccountTokenKey,
  NATIVE_TOKEN_SLUG,
  getNetwork,
} from "core/common";

import { fetchAccountTokens } from "./account/assets";

const DEAD_ADDRESS = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";

export const refreshTotalBalances = memoize(
  async (chainId: number, accountAddress: string) => {
    const allAssets = await repo.accountTokens
      .where("[chainId+tokenType+accountAddress]")
      .equals([chainId, TokenType.Asset, accountAddress])
      .toArray();

    let allAssetsSum = new BigNumber(0);

    for (const asset of allAssets) {
      if (asset.status === TokenStatus.Disabled) {
        continue;
      }

      allAssetsSum = allAssetsSum.plus(asset.balanceUSD ?? 0);
    }

    const activeChainPortfolioUSD = allAssetsSum.toString();

    const existingNativeTokens = await repo.accountTokens
      .where("[accountAddress+tokenSlug]")
      .equals([accountAddress, NATIVE_TOKEN_SLUG])
      .toArray();

    let activeNativeToken: AccountToken | undefined;
    let totalBalance = new BigNumber(0);

    for (const token of existingNativeTokens) {
      if (token.chainId === chainId) {
        activeNativeToken = token;
      }

      if (token.portfolioUSD) {
        totalBalance = totalBalance.plus(token.portfolioUSD);
      }
    }

    if (activeNativeToken) {
      await repo.accountTokens.put(
        {
          ...activeNativeToken,
          portfolioUSD: activeChainPortfolioUSD,
          portfolioRefreshedAt: Date.now(),
        },
        createAccountTokenKey({
          chainId,
          accountAddress,
          tokenSlug: NATIVE_TOKEN_SLUG,
        }),
      );
    }

    updateTotalBalance(accountAddress, totalBalance);
  },
  {
    cacheKey: (args) => args.join(),
    maxAge: 5_000,
  },
);

export const fetchTotalChainBalance = withOfflineCache(
  async (chainId: number, accountAddress: string) => {
    const accTokens = await fetchAccountTokens(chainId, accountAddress);
    const network = await getNetwork(chainId).catch(() => null);

    let totalValue = new BigNumber(0);

    for (const token of accTokens) {
      // Skip if mainnet token without metadata
      // Skip if dead address
      if (
        (network?.type === "mainnet" &&
          (!token.contract_ticker_symbol || !token.contract_decimals)) ||
        getAddress(token.contract_address) === DEAD_ADDRESS
      ) {
        continue;
      }

      if (token.quote) totalValue = totalValue.plus(token.quote);
    }

    return totalValue.toString();
  },
  {
    key: ([chainId, accountAddress]) =>
      `total_balance_${chainId}_${accountAddress}`,
    hotMaxAge: 30_000, // 30 sec
    coldMaxAge: 10 * 60_000, // 10 min
  },
);
