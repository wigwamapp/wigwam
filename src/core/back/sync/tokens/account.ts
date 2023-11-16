import BigNumber from "bignumber.js";
import { IndexableTypeArray } from "dexie";
import { ethers } from "ethers";
import memoize from "mem";
import { sanitizeUrl } from "lib/nft-metadata/utils";

import {
  AccountAsset,
  AccountNFT,
  AccountToken,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import {
  createAccountTokenKey,
  createTokenSlug,
  getNativeTokenLogoUrl,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
import { getNetwork } from "core/common/network";
import * as repo from "core/repo";

import { getCxChain, getUserTokens, getUserNfts } from "../indexerApi";
import { getCoinGeckoPrices } from "../coinGecko";
import { getBalanceFromChain } from "../chain";
import { parseContentType } from "../utils";

export const syncAccountTokens = memoize(
  async (chainId: number, accountAddress: string, tokenType: TokenType) => {
    const [
      cxChain,
      existingAccTokens,
      { nativeCurrency, chainTag, type: netType },
    ] = await Promise.all([
      getCxChain(chainId),
      repo.accountTokens
        .where("[chainId+tokenType+accountAddress]")
        .equals([chainId, tokenType, accountAddress])
        .toArray(),
      getNetwork(chainId),
    ]);

    const accTokens: AccountToken[] = [];
    const dbKeys: IndexableTypeArray = [];

    let existingTokensMap: Map<string, AccountToken> | undefined;

    if (cxChain) {
      existingTokensMap = new Map(
        existingAccTokens.map((t) => [t.tokenSlug, t]),
      );

      const indexerUserTokens = await (tokenType === TokenType.Asset
        ? getUserTokens(cxChain.name, accountAddress)
        : getUserNfts(cxChain.id, accountAddress)
      ).catch(() => null);

      if (indexerUserTokens) {
        for (const token of indexerUserTokens) {
          let tokenSlug;

          /**
           * For assets
           */
          if (tokenType === TokenType.Asset) {
            const native = token.native_token;

            if (native) continue;

            tokenSlug = createTokenSlug({
              standard: native ? TokenStandard.Native : TokenStandard.ERC20,
              address: native ? "0" : ethers.getAddress(token.contract_address),
              id: "0",
            });
            const rawBalanceBN = BigInt(
              new BigNumber(token.balance).integerValue().toString(),
            );

            const existing = existingTokensMap.get(tokenSlug) as AccountAsset;

            if (
              (!existing && rawBalanceBN === 0n) ||
              (netType === "mainnet" && !token.quote)
            ) {
              continue;
            }

            const metadata = native
              ? {
                  symbol: nativeCurrency.symbol,
                  name: nativeCurrency.name,
                  logoUrl: getNativeTokenLogoUrl(chainTag),
                }
              : {
                  symbol: token.contract_ticker_symbol?.slice(0, 8) || "NONAME",
                  name: token.contract_name || "Unknown",
                  logoUrl: netType === "mainnet" ? token.logo_url : undefined,
                };

            const rawBalance = rawBalanceBN.toString();
            const priceUSD = token.quote_rate
              ? new BigNumber(token.quote_rate).toString()
              : existing?.priceUSD;
            const balanceUSD =
              token.quote ||
              (priceUSD
                ? new BigNumber(rawBalance)
                    .div(new BigNumber(10).pow(token.contract_decimals))
                    .times(priceUSD)
                    .toNumber()
                : existing?.balanceUSD ?? 0);

            accTokens.push(
              existing
                ? {
                    ...existing,
                    ...metadata,
                    rawBalance,
                    balanceUSD,
                    priceUSD,
                  }
                : {
                    chainId,
                    accountAddress,
                    tokenSlug,
                    tokenType: TokenType.Asset,
                    status: native ? TokenStatus.Native : TokenStatus.Enabled,
                    // Metadata
                    decimals: native
                      ? nativeCurrency.decimals
                      : token.contract_decimals,
                    ...metadata,
                    // Volumes
                    rawBalance,
                    balanceUSD,
                    priceUSD,
                    portfolioUSD: native ? "-1" : undefined,
                  },
            );
            /**
             * For NFTs
             */
          } else {
            if (!token.nft_data) continue;

            const contractAddress = ethers.getAddress(token.contract_address);
            const tokenId = String(token.nft_data.token_id);
            const rawBalanceBN = BigInt(1); // TODO: token.amount

            tokenSlug = createTokenSlug({
              standard: token.supports_erc?.includes("erc1155")
                ? TokenStandard.ERC1155
                : TokenStandard.ERC721,
              address: contractAddress,
              id: tokenId,
            });

            const existing = existingTokensMap.get(tokenSlug) as AccountNFT;

            if (!existing && rawBalanceBN === 0n) {
              continue;
            }

            const priceUSD =
              token.usd_price || token.usd_price === 0
                ? new BigNumber(token.usd_price).toString()
                : existing?.priceUSD;

            const external = token.nft_data.external_data;
            const contentType =
              existing?.contentType ||
              parseContentType(external?.asset_mime_type);

            const metadata = {
              contractAddress,
              tokenId,
              name: existing?.name || external?.name || `#${tokenId}`,
              description: existing?.description || external?.description,
              thumbnailUrl:
                existing?.thumbnailUrl ||
                sanitizeUrl(
                  external?.image ||
                    (contentType === "image_url"
                      ? external?.asset_url
                      : undefined),
                ),
              contentUrl:
                existing?.contentUrl ||
                sanitizeUrl(external?.asset_url || external?.image),
              contentType,
              collectionId: existing?.collectionId,
              collectionName: existing?.collectionName || token.contract_name,
              detailUrl: existing?.detailUrl || token.nft_data.token_url,
              priceUSD,
              attributes: existing?.attributes ?? external?.attributes,
              tpId: undefined,
            };

            const rawBalance = rawBalanceBN.toString();
            const balanceUSD = priceUSD
              ? new BigNumber(priceUSD).toNumber()
              : existing?.balanceUSD ?? 0;

            let status: TokenStatus;

            if (!existing) {
              // The new token, just add it
              status = TokenStatus.Enabled;
            } else if (
              new BigNumber(existing.rawBalance).gt(0) &&
              rawBalanceBN === 0n
            ) {
              // Balance changed from positive to zero
              status = TokenStatus.Disabled;
            } else if (
              new BigNumber(existing.rawBalance).isZero() &&
              rawBalanceBN > 0n
            ) {
              // Balance changed from zero to positive
              status = TokenStatus.Enabled;
            } else {
              // Existing token, rest cases
              status = existing.status;
            }

            accTokens.push(
              existing
                ? {
                    ...existing,
                    ...metadata,
                    rawBalance,
                    balanceUSD,
                    status,
                  }
                : {
                    chainId,
                    accountAddress,
                    tokenSlug,
                    tokenType: TokenType.NFT,
                    status,
                    // Metadata
                    ...metadata,
                    // Volumes
                    rawBalance,
                    balanceUSD,
                  },
            );
          }

          dbKeys.push(
            createAccountTokenKey({
              chainId,
              accountAddress,
              tokenSlug,
            }),
          );

          existingTokensMap.delete(tokenSlug);
        }
      }
    }

    // Fetch data from the chain for tokens
    // that were not retrieved from the indexer

    const restTokens = existingTokensMap
      ? Array.from(existingTokensMap.values())
      : existingAccTokens;

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

        accTokens.push({
          ...token,
          rawBalance,
          balanceUSD,
        });

        dbKeys.push(
          createAccountTokenKey({
            chainId,
            accountAddress,
            tokenSlug: token.tokenSlug,
          }),
        );
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

    await repo.accountTokens.bulkPut(accTokens, dbKeys);
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 40_000, // 40 sec
  },
);
