import BigNumber from "bignumber.js";

import { AccountAsset, TokenStatus, TokenType } from "core/types";
import { createAccountTokenKey, parseTokenSlug } from "core/common/tokens";
import * as repo from "core/repo";

import { syncStarted, synced } from "../../state";
import { getDebankChain, debankApi } from "../debank";
import { getCoinGeckoPrices } from "../coinGecko";
import { getBalanceFromChain, getAccountTokenFromChain } from "../chain";
import { enqueueTokensSync } from "./queue";

const stack = new Set<string>();

export async function addFindTokenRequest(
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) {
  const dbKey = createAccountTokenKey({
    chainId,
    accountAddress,
    tokenSlug,
  });

  if (stack.has(dbKey)) return;

  stack.add(dbKey);
  syncStarted(chainId);

  try {
    await enqueueTokensSync(async () => {
      let tokenToAdd: AccountAsset | undefined;

      const { address: tokenAddress } = parseTokenSlug(tokenSlug);

      const existing = await repo.accountTokens.get(dbKey);
      if (existing) {
        const balance = await getBalanceFromChain(
          chainId,
          tokenSlug,
          accountAddress
        );

        const rawBalance = balance?.toString() ?? "0";
        const balanceUSD =
          "priceUSD" in existing && existing.priceUSD
            ? new BigNumber(rawBalance)
                .div(10 ** existing.decimals)
                .times(existing.priceUSD)
                .toNumber()
            : 0;

        await repo.accountTokens.put(
          {
            ...existing,
            rawBalance,
            balanceUSD,
          },
          dbKey
        );

        return;
      }

      const [debankChain, coinGeckoPrices] = await Promise.all([
        getDebankChain(chainId),
        getCoinGeckoPrices(chainId, [tokenAddress]),
      ]);

      const cgTokenAddress = tokenAddress.toLowerCase();
      const cgPrice = coinGeckoPrices[cgTokenAddress];
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

  stack.delete(dbKey);
  setTimeout(() => synced(chainId), 500);
}
