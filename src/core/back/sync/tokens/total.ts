import BigNumber from "bignumber.js";
import memoize from "mem";
import { withOfflineCache } from "lib/ext/offlineCache";

import { AccountToken, TokenStatus, TokenType } from "core/types";
import * as repo from "core/repo";
import {
  updateTotalBalance,
  createAccountTokenKey,
  NATIVE_TOKEN_SLUG,
} from "core/common";

import { getDxChain, indexerApi } from "../indexer";

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
    const dxChain = await getDxChain(chainId);
    if (!dxChain) return null;

    const res = await indexerApi.get<{ usd_value: number | string }>(
      `/d/v1/user/chain_balance`,
      {
        params: {
          id: accountAddress,
          chain_id: dxChain.id,
          _authAddress: accountAddress,
        },
      },
    );

    const value = res.data.usd_value;

    return value ? new BigNumber(res.data.usd_value).toString() : null;
  },
  {
    key: ([chainId, accountAddress]) =>
      `total_balance_${chainId}_${accountAddress}`,
    hotMaxAge: 30_000, // 30 sec
    coldMaxAge: 10 * 60_000, // 10 min
  },
);
