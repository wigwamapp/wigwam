import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import memoize from "mem";
import { sanitizeUrl } from "lib/nft-metadata/utils";

import {
  AccountNFT,
  AccountToken,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import { createTokenSlug } from "core/common/tokens";

import { getBalanceFromChain } from "../../chain";
import { parseContentType } from "../../utils";
import { prepareAccountTokensSync } from "./utils";

export const syncAccountNFTs = memoize(
  async (chainId: number, accountAddress: string) => {
    const {
      cxAccountTokens,
      existingAccTokens,
      existingTokensMap,
      addToken,
      releaseToRepo,
    } = await prepareAccountTokensSync(chainId, accountAddress, TokenType.NFT);

    for (const coll of cxAccountTokens) {
      if (!coll.nft_data?.length) continue;

      const contractAddress = ethers.getAddress(coll.contract_address);
      const balanceOne = coll.nft_data.length === +coll.balance;
      const standard = coll.supports_erc?.includes("erc1155")
        ? TokenStandard.ERC1155
        : TokenStandard.ERC721;

      for (const nftData of coll.nft_data) {
        const tokenId = String(nftData.token_id);
        const tokenSlug = createTokenSlug({
          standard,
          address: contractAddress,
          id: tokenId,
        });

        const existing = existingTokensMap.get(tokenSlug) as AccountNFT;

        // Skip no name tokens
        if (
          !existing &&
          (!nftData.external_data?.image || !nftData.external_data?.asset_url)
        ) {
          continue;
        }

        const rawBalanceBN =
          balanceOne || standard === TokenStandard.ERC721
            ? BigInt(1)
            : await getBalanceFromChain(chainId, tokenSlug, accountAddress);

        if (!rawBalanceBN || (!existing && rawBalanceBN === 0n)) {
          continue;
        }

        const priceUSD = coll.floor_price_quote
          ? new BigNumber(coll.floor_price_quote).toString()
          : existing?.priceUSD;

        const extData = nftData.external_data;

        // Avoid null and empty string
        const collName = coll.contract_name || undefined;
        const description = extData?.description || undefined;
        const assetUrl = extData?.asset_url || undefined;
        const imageUrl = extData?.image || undefined;
        const animationUrl = extData?.animation_url || undefined;
        const externalUrl = extData?.external_url || undefined;

        const contentType =
          existing?.contentType ||
          parseContentType(extData?.asset_mime_type ?? undefined);

        const metadata = {
          contractAddress,
          tokenId,
          name: existing?.name || extData?.name || `#${tokenId}`,
          description: existing?.description || description,
          thumbnailUrl:
            existing?.thumbnailUrl ||
            sanitizeUrl(
              imageUrl || (contentType === "image_url" ? assetUrl : undefined),
            ),
          contentUrl:
            existing?.contentUrl ||
            sanitizeUrl(assetUrl ?? imageUrl ?? animationUrl),
          contentType,
          collectionId: existing?.collectionId,
          collectionName: existing?.collectionName || collName,
          detailUrl: existing?.detailUrl || externalUrl,
          attributes:
            existing?.attributes ??
            (extData?.attributes?.filter(Boolean) as any),
          priceUSD,
        };

        const status = getNextStatus(existing, rawBalanceBN);
        const rawBalance = rawBalanceBN.toString();
        const balanceUSD = existing?.balanceUSD ?? 0;

        addToken({
          ...(existing ?? {
            chainId,
            accountAddress,
            tokenSlug,
            tokenType: TokenType.NFT,
          }),
          // Metadata
          ...metadata,
          // Volumes
          status,
          rawBalance,
          balanceUSD,
        });
      }
    }

    // Fetch data from the chain for tokens
    // that were not retrieved from the indexer

    const restTokens = Array.from(existingTokensMap.values());

    if (
      restTokens.length > 0 &&
      // Avoid fetch balance from chain for huge amount of NFTs
      (restTokens.length !== existingAccTokens.length || restTokens.length < 50)
    ) {
      const balances = await Promise.all(
        restTokens.map(({ tokenSlug }) =>
          getBalanceFromChain(chainId, tokenSlug, accountAddress),
        ),
      );

      for (let i = 0; i < restTokens.length; i++) {
        const rawBalanceBN = balances[i];
        if (!rawBalanceBN) continue;

        const token = restTokens[i];
        const rawBalance = rawBalanceBN.toString();
        const status = getNextStatus(token, rawBalanceBN);

        addToken({
          ...token,
          rawBalance,
          status,
        });
      }
    }

    await releaseToRepo();
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 60_000, // 60 sec
  },
);

function getNextStatus(
  existing: AccountToken,
  rawBalanceBN: bigint,
): TokenStatus {
  if (!existing) {
    // The new token, just add it
    return TokenStatus.Enabled;
  } else if (new BigNumber(existing.rawBalance).gt(0) && rawBalanceBN === 0n) {
    // Balance changed from positive to zero
    return TokenStatus.Disabled;
  } else if (new BigNumber(existing.rawBalance).isZero() && rawBalanceBN > 0n) {
    // Balance changed from zero to positive
    return TokenStatus.Enabled;
  } else {
    // Existing token, rest cases
    return existing.status;
  }
}
