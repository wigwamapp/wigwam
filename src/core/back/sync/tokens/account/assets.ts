import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import memoize from "mem";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import { createTokenSlug, parseTokenSlug } from "core/common/tokens";
import { getNetwork } from "core/common/network";

import { getCoinGeckoPrices } from "../../coinGecko";
import { getBalanceFromChain } from "../../chain";
import { prepareAccountTokensSync } from "./utils";
import { fetchCxAccountTokens } from "../../indexer";

export const syncAccountAssets = memoize(
  async (chainId: number, accountAddress: string) => {
    const [
      network,
      freshAccTokensData,
      { existingTokensMap, accTokens, addToken, releaseToRepo },
    ] = await Promise.all([
      getNetwork(chainId),
      fetchCxAccountTokens(chainId, accountAddress, TokenType.Asset).catch(
        (err) => {
          console.error(err);
          return [];
        },
      ),
      prepareAccountTokensSync(chainId, accountAddress, TokenType.Asset),
    ]);

    for (const token of freshAccTokensData) {
      const native = token.native_token;

      // Skip for native token, we sync native tokens in separate module
      if (native) continue;

      const tokenSlug = createTokenSlug({
        standard: TokenStandard.ERC20,
        address: ethers.getAddress(token.contract_address),
        id: "0",
      });

      const existing = existingTokensMap.get(tokenSlug) as AccountAsset;

      const rawBalanceBN = new BigNumber(token.balance).integerValue();

      // Skip if alreaady exist and balance is zero
      // Skip if mainnet token without price
      if (
        (!existing && rawBalanceBN.isZero()) ||
        (network.type === "mainnet" && !token.quote_rate)
      ) {
        continue;
      }

      const metadata = {
        symbol:
          token.contract_ticker_symbol?.slice(0, 8) ||
          existing.symbol ||
          "NONAME",
        name: token.contract_name || existing.name || "Unknown",
        decimals: token.contract_decimals ?? existing.decimals ?? 18,
        logoUrl:
          network.type === "mainnet"
            ? token.logo_url ?? undefined
            : existing.logoUrl,
      };

      const rawBalance = rawBalanceBN.toString();

      const priceUSD = token.quote_rate
        ? new BigNumber(token.quote_rate).toString()
        : existing?.priceUSD;

      const balanceUSD =
        token.quote ||
        (priceUSD
          ? rawBalanceBN
              .div(new BigNumber(10).pow(metadata.decimals))
              .times(priceUSD)
              .toNumber()
          : existing?.balanceUSD ?? 0);

      addToken({
        ...(existing ?? {
          chainId,
          accountAddress,
          tokenSlug,
          tokenType: TokenType.Asset,
          status: TokenStatus.Enabled,
        }),
        // Metadata
        ...metadata,
        // Volumes
        rawBalance,
        balanceUSD,
        priceUSD,
      });
    }

    // Fetch data from the chain for tokens
    // that were not retrieved from the indexer

    const restTokens = Array.from(existingTokensMap.values()) as AccountAsset[];

    if (restTokens.length > 0) {
      const balances = await Promise.all(
        restTokens.map(({ tokenSlug }) =>
          getBalanceFromChain(chainId, tokenSlug, accountAddress),
        ),
      );

      for (let i = 0; i < restTokens.length; i++) {
        const balance = balances[i];
        if (balance === null) continue;

        const token = restTokens[i];
        const rawBalance = balance.toString();

        addToken({
          ...token,
          rawBalance,
        });
      }
    }

    // Fetch coingecko prices

    const tokenAddresses = accTokens.map(
      (t) => parseTokenSlug(t.tokenSlug).address,
    );
    const restTokenSlugs = new Set(restTokens.map((t) => t.tokenSlug));

    const cgPrices = await getCoinGeckoPrices(tokenAddresses);

    if (Object.keys(cgPrices).length > 0) {
      for (let i = 0; i < accTokens.length; i++) {
        const token = accTokens[i] as AccountAsset;
        const tokenAddress = tokenAddresses[i];

        const price = cgPrices[tokenAddress];

        if (price && price.usd) {
          const priceUSD = new BigNumber(price.usd);

          token.priceUSD = priceUSD.toString();
          token.priceUSDChange = price.usd_24h_change?.toString();
          token.balanceUSD = new BigNumber(token.rawBalance)
            .div(new BigNumber(10).pow(token.decimals))
            .times(priceUSD)
            .toNumber();
        } else {
          if (restTokenSlugs.has(token.tokenSlug)) {
            token.balanceUSD = 0;
            delete token.priceUSD;
            delete token.priceUSDChange;
          }
        }
      }
    }

    await releaseToRepo();
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 40_000, // 40 sec
  },
);
