import BigNumber from "bignumber.js";
import memoize from "mem";

import { AccountAsset, TokenStatus, TokenType } from "core/types";
import {
  createAccountTokenKey,
  getNativeTokenLogoUrl,
  NATIVE_TOKEN_SLUG,
} from "core/common/tokens";
import { getNetwork } from "core/common/network";
import * as repo from "core/repo";

import { getCoinGeckoNativeTokenPrice } from "../dexPrices";
import { getBalanceFromChain } from "../chain";

export const syncNativeTokens = memoize(
  async (chainId: number, _buster: string, addresses: string | string[]) => {
    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    const dbKeys = addresses.map((address) =>
      createAccountTokenKey({
        chainId,
        accountAddress: address,
        tokenSlug: NATIVE_TOKEN_SLUG,
      }),
    );

    const [
      { nativeCurrency, chainTag },
      existingTokens,
      balances,
      allAccAssets,
      cgPrice,
    ] = await Promise.all([
      getNetwork(chainId),
      repo.accountTokens.bulkGet(dbKeys),
      Promise.all(
        addresses.map((address) =>
          getBalanceFromChain(chainId, NATIVE_TOKEN_SLUG, address),
        ),
      ),
      Promise.all(
        addresses.map((address) =>
          repo.accountTokens
            .where("[chainId+tokenType+accountAddress]")
            .equals([chainId, TokenType.Asset, address])
            .toArray(),
        ),
      ),
      getCoinGeckoNativeTokenPrice(chainId),
    ]);

    const priceUSD = cgPrice?.usd?.toString();
    const priceUSDChange = cgPrice?.usd_24h_change?.toString();

    await repo.accountTokens.bulkPut(
      addresses.map((address, i) => {
        const existing = existingTokens[i] as AccountAsset;
        const balance = balances[i];
        const allAssets = allAccAssets[i];

        let allAssetsSum = new BigNumber(0);

        for (const asset of allAssets) {
          if (
            asset.tokenSlug === NATIVE_TOKEN_SLUG ||
            asset.status === TokenStatus.Disabled
          ) {
            continue;
          }

          allAssetsSum = allAssetsSum.plus(asset.balanceUSD ?? 0);
        }

        let portfolioUSD =
          existing?.portfolioUSD === "-1" && allAssetsSum.isZero()
            ? "0"
            : allAssetsSum.toString();

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

          portfolioUSD = new BigNumber(portfolioUSD)
            .plus(balanceUSD)
            .toString();

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

          portfolioUSD = new BigNumber(portfolioUSD)
            .plus(balanceUSD)
            .toString();

          return {
            chainId,
            accountAddress: address,
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
  },
  {
    cacheKey: ([chainId, buster]) => `${chainId}${buster}`,
    maxAge: 10_000, // 10 sec
  },
);
