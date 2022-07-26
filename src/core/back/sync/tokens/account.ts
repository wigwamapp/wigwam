import BigNumber from "bignumber.js";
import { IndexableTypeArray } from "dexie";
import { ethers } from "ethers";
import memoize from "mem";

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

import { getDebankChain, debankApi } from "../debank";
import { getCoinGeckoPrices } from "../coinGecko";
import { getBalanceFromChain } from "../chain";

export const syncAccountTokens = memoize(
  async (chainId: number, accountAddress: string, tokenType: TokenType) => {
    const [debankChain, existingAccTokens, { nativeCurrency, chainTag }] =
      await Promise.all([
        getDebankChain(chainId),
        repo.accountTokens
          .where("[chainId+tokenType+accountAddress]")
          .equals([chainId, tokenType, accountAddress])
          .toArray(),
        getNetwork(chainId),
      ]);

    const accTokens: AccountToken[] = [];
    const dbKeys: IndexableTypeArray = [];

    let existingTokensMap: Map<string, AccountToken> | undefined;

    if (debankChain) {
      existingTokensMap = new Map(
        existingAccTokens.map((t) => [t.tokenSlug, t])
      );

      const { data: debankUserTokens } = await debankApi
        .get(
          `/user/${tokenType === TokenType.Asset ? "token_list" : "nft_list"}`,
          {
            params: {
              id: accountAddress,
              chain_id: debankChain.id,
              is_all: false,
            },
          }
        )
        .catch(() => ({ data: null }));

      if (debankUserTokens) {
        for (const token of debankUserTokens) {
          let tokenSlug;

          /**
           * For assets
           */
          if (tokenType === TokenType.Asset) {
            const native = token.id === debankChain.native_token_id;

            if (native) continue;

            tokenSlug = createTokenSlug({
              standard: native ? TokenStandard.Native : TokenStandard.ERC20,
              address: native ? "0" : ethers.utils.getAddress(token.id),
              id: "0",
            });
            const rawBalanceBN = ethers.BigNumber.from(
              token.raw_amount_hex_str
            );

            const existing = existingTokensMap.get(tokenSlug) as AccountAsset;

            if (!existing && rawBalanceBN.isZero()) {
              continue;
            }

            const metadata = native
              ? {
                  symbol: nativeCurrency.symbol,
                  name: nativeCurrency.name,
                  logoUrl: getNativeTokenLogoUrl(chainTag),
                }
              : {
                  symbol: token.symbol,
                  name: token.name,
                  logoUrl: token.logo_url,
                };

            const rawBalance = rawBalanceBN.toString();
            const priceUSD = token.price
              ? new BigNumber(token.price).toString()
              : existing?.priceUSD;
            const balanceUSD = priceUSD
              ? new BigNumber(rawBalance)
                  .div(10 ** token.decimals)
                  .times(priceUSD)
                  .toNumber()
              : existing?.balanceUSD;

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
                    decimals: native ? nativeCurrency.decimals : token.decimals,
                    ...metadata,
                    // Volumes
                    rawBalance,
                    balanceUSD,
                    priceUSD,
                    portfolioUSD: native ? "-1" : undefined,
                  }
            );
            /**
             * For NFTs
             */
          } else {
            const contractAddress = ethers.utils.getAddress(token.contract_id);
            const tokenId = String(token.inner_id);
            const rawBalanceBN = ethers.BigNumber.from(token.amount);

            tokenSlug = createTokenSlug({
              standard: token.is_erc721
                ? TokenStandard.ERC721
                : TokenStandard.ERC1155,
              address: contractAddress,
              id: tokenId,
            });

            const existing = existingTokensMap.get(tokenSlug) as AccountNFT;

            if (!existing && rawBalanceBN.isZero()) {
              continue;
            }

            const priceUSD =
              token.usd_price || token.usd_price === 0
                ? new BigNumber(token.usd_price).toString()
                : existing?.priceUSD;

            const metadata = {
              contractAddress,
              tokenId,
              name: existing?.name || token.name || `#${tokenId}`,
              description: existing?.description || token.description,
              thumbnailUrl:
                existing?.thumbnailUrl || token.thumbnail_url || token.content,
              contentUrl:
                existing?.contentUrl || token.content || token.thumbnail_url,
              contentType: existing?.contentType || token.content_type,
              collectionId: existing?.collectionId || token.collection_id,
              collectionName: existing?.collectionName || token.contract_name,
              detailUrl: existing?.detailUrl || token.detail_url,
              priceUSD,
              attributes: existing?.attributes ?? token.attributes,
              tpId: token.id,
            };

            const rawBalance = rawBalanceBN.toString();
            const balanceUSD = priceUSD
              ? new BigNumber(priceUSD).toNumber()
              : existing?.balanceUSD ?? 0;

            accTokens.push(
              existing
                ? {
                    ...existing,
                    ...metadata,
                    rawBalance,
                    balanceUSD,
                  }
                : {
                    chainId,
                    accountAddress,
                    tokenSlug,
                    tokenType: TokenType.NFT,
                    status: TokenStatus.Enabled,
                    // Metadata
                    ...metadata,
                    // Volumes
                    rawBalance,
                    balanceUSD,
                  }
            );
          }

          dbKeys.push(
            createAccountTokenKey({
              chainId,
              accountAddress,
              tokenSlug,
            })
          );

          existingTokensMap.delete(tokenSlug);
        }
      }
    }

    const restTokens = existingTokensMap
      ? Array.from(existingTokensMap.values())
      : existingAccTokens;

    if (restTokens.length > 0) {
      const balances = await Promise.all(
        restTokens.map(({ tokenSlug }) =>
          tokenSlug !== NATIVE_TOKEN_SLUG
            ? getBalanceFromChain(chainId, tokenSlug, accountAddress)
            : null
        )
      );

      for (let i = 0; i < restTokens.length; i++) {
        const balance = balances[i];

        if (!balance) continue;

        const token = restTokens[i];

        const rawBalance = balance.toString();
        const balanceUSD =
          token.tokenType === TokenType.Asset && token.priceUSD
            ? new BigNumber(rawBalance)
                .div(10 ** token.decimals)
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
          })
        );
      }
    }

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
          token.tokenSlug
        ).address.toLowerCase();
        const price = cgPrices[cgTokenAddress];

        if (price && price.usd) {
          const priceUSD = new BigNumber(price.usd);

          token.priceUSD = priceUSD.toString();
          token.priceUSDChange = price.usd_24h_change?.toString();
          token.balanceUSD = new BigNumber(token.rawBalance)
            .div(10 ** token.decimals)
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
  }
);
