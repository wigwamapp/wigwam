import BigNumber from "bignumber.js";
import memoize from "mem";

import { AccountToken, TokenStatus, TokenType } from "core/types";
import * as repo from "core/repo";
import {
  updateTotalBalance,
  createAccountTokenKey,
  NATIVE_TOKEN_SLUG,
} from "core/common";

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
