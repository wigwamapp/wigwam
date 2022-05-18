import BigNumber from "bignumber.js";

import { AccountAsset, TokenStatus, TokenType } from "core/types";
import { createAccountTokenKey, parseTokenSlug } from "core/common/tokens";
import * as repo from "core/repo";

import { syncStarted, synced } from "../../state";
import { getDebankChain, debankApi } from "../debank";
import { getCoinGeckoPrices } from "../coinGecko";
import { getBalanceFromChain, getAccountTokenFromChain } from "../chain";
import { enqueueTokensSync } from "./queue";

export async function addFindTokenRequest(
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) {
  syncStarted(chainId);

  try {
    await enqueueTokensSync(async () => {
      let tokenToAdd: AccountAsset | undefined;

      const { address: tokenAddress } = parseTokenSlug(tokenSlug);
      const dbKey = createAccountTokenKey({
        chainId,
        accountAddress,
        tokenSlug,
      });

      const existing = await repo.accountTokens.get(dbKey);
      if (existing) return;

      const [debankChain, coinGeckoPrices] = await Promise.all([
        getDebankChain(chainId),
        getCoinGeckoPrices(chainId, [tokenAddress]),
      ]);

      const cgPrice = coinGeckoPrices[tokenAddress];
      let priceUSD = cgPrice?.usd?.toString();
      const priceUSDChange = cgPrice?.usd_24h_change?.toString();

      if (debankChain) {
        const [{ data: dbToken }, balance] = await Promise.all([
          debankApi
            .get("/token", {
              params: {
                chain_id: debankChain.id,
                id: tokenAddress,
              },
            })
            .catch(() => ({ data: null })),
          getBalanceFromChain(chainId, tokenSlug, accountAddress),
        ]);

        if (dbToken) {
          if (!priceUSD && dbToken.price) {
            priceUSD = new BigNumber(dbToken.price).toString();
          }

          const rawBalance = balance?.toString() ?? "0";
          const balanceUSD = priceUSD
            ? new BigNumber(rawBalance)
                .div(10 ** dbToken.decimals)
                .times(priceUSD)
                .toNumber()
            : 0;

          tokenToAdd = {
            tokenType: TokenType.Asset,
            status: TokenStatus.Enabled,
            chainId,
            accountAddress,
            tokenSlug,
            // Metadata
            decimals: dbToken.decimals,
            name: dbToken.name,
            symbol: dbToken.symbol,
            logoUrl: dbToken.logo_url,
            // Volumes
            rawBalance,
            balanceUSD,
            priceUSD,
            priceUSDChange,
          };
        }
      }

      if (!tokenToAdd) {
        const token = await getAccountTokenFromChain(
          chainId,
          accountAddress,
          tokenSlug
        );
        if (!token) return;

        const rawBalance = token.balance.toString();
        const balanceUSD = priceUSD
          ? new BigNumber(rawBalance)
              .div(10 ** token.decimals)
              .times(priceUSD)
              .toNumber()
          : 0;

        tokenToAdd = {
          tokenType: TokenType.Asset,
          status: TokenStatus.Enabled,
          chainId,
          accountAddress,
          tokenSlug,
          // Metadata
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol,
          // Volumes
          rawBalance,
          balanceUSD,
          priceUSD,
          priceUSDChange,
        };
      }

      await repo.accountTokens.put(tokenToAdd, dbKey);
    });
  } catch (err) {
    console.error(err);
  }

  synced(chainId);
}
