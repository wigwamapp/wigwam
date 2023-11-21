import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import memoize from "mem";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import {
  createTokenSlug,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
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

      const rawBalanceBN = BigInt(
        new BigNumber(token.balance).integerValue().toString(),
      );

      // Skip if alreaady exist and balance is zero
      // Skip if mainnet token without price
      if (
        (!existing && rawBalanceBN === 0n) ||
        (network.type === "mainnet" && !token.quote)
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
          ? new BigNumber(rawBalance)
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

    const restTokens = Array.from(existingTokensMap.values());

    if (restTokens.length > 0) {
      const balances = await Promise.all(
        restTokens.map(({ tokenSlug }) =>
          tokenSlug !== NATIVE_TOKEN_SLUG
            ? getBalanceFromChain(chainId, tokenSlug, accountAddress)
            : null,
        ),
      );

      for (let i = 0; i < restTokens.length; i++) {
        const balance = balances[i];

        if (!balance) continue;

        const token = restTokens[i];

        const rawBalance = balance.toString();
        const balanceUSD =
          token.tokenType === TokenType.Asset && token.priceUSD
            ? new BigNumber(rawBalance)
                .div(new BigNumber(10).pow(token.decimals))
                .times(token.priceUSD)
                .toNumber()
            : token.balanceUSD;

        addToken({
          ...token,
          rawBalance,
          balanceUSD,
        });
      }
    }

    // Fetch coingecko prices

    const tokenAddresses: string[] = [];

    for (const token of accTokens) {
      const { standard, address } = parseTokenSlug(token.tokenSlug);

      if (standard === TokenStandard.ERC20) {
        tokenAddresses.push(address);
      }
    }

    const cgPrices = await getCoinGeckoPrices(chainId, tokenAddresses);

    if (Object.keys(cgPrices).length > 0) {
      for (let token of accTokens) {
        if (token.status === TokenStatus.Native) continue;

        token = token as AccountAsset;

        const cgTokenAddress = parseTokenSlug(
          token.tokenSlug,
        ).address.toLowerCase();
        const price = cgPrices[cgTokenAddress];

        if (price && price.usd) {
          const priceUSD = new BigNumber(price.usd);

          token.priceUSD = priceUSD.toString();
          token.priceUSDChange = price.usd_24h_change?.toString();
          token.balanceUSD = new BigNumber(token.rawBalance)
            .div(new BigNumber(10).pow(token.decimals))
            .times(priceUSD)
            .toNumber();
        } else {
          delete token.priceUSD;
          delete token.priceUSDChange;
          token.balanceUSD = 0;
        }
      }
    }

    await releaseToRepo();
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 30_000, // 30 sec
  },
);
