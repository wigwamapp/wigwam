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
import { getNetwork } from "core/common/network";

import { getBalanceFromChain } from "../../chain";
import { parseContentType } from "../../utils";
import { prepareAccountTokensSync } from "./utils";
import { fetchAccountNFTs } from "../../indexer";

export const syncAccountNFTs = memoize(
  async (chainId: number, accountAddress: string) => {
    const network = await getNetwork(chainId);
    if (network.type !== "mainnet") return;

    const [freshAccTokensData, { existingTokensMap, addToken, releaseToRepo }] =
      await Promise.all([
        fetchAccountNFTs(chainId, accountAddress),
        prepareAccountTokensSync<AccountNFT>(
          chainId,
          accountAddress,
          TokenType.NFT,
        ),
      ]);

    for (const coll of freshAccTokensData) {
      if (!coll.assets?.length) continue;

      const contractAddress = ethers.getAddress(coll.contract_address);

      for (const nftData of coll.assets) {
        const standard = nftData.erc_type?.includes("erc1155")
          ? TokenStandard.ERC1155
          : TokenStandard.ERC721;
        const tokenId = nftData.token_id;
        const tokenSlug = createTokenSlug({
          standard,
          address: contractAddress,
          id: tokenId,
        });

        const existing = existingTokensMap.get(tokenSlug) as AccountNFT;

        // Skip to just fetch balance if disabled
        if (existing?.status === TokenStatus.Disabled) continue;
        // Skip no name tokens
        if (!existing && !nftData.image_uri && !nftData.content_uri) {
          continue;
        }

        const rawBalanceBN = nftData.amount && new BigNumber(nftData.amount);

        if (!rawBalanceBN || (!existing && rawBalanceBN.isZero())) {
          continue;
        }

        const priceUSD = nftData.latest_trade_price
          ? new BigNumber(nftData.latest_trade_price).toString()
          : existing?.priceUSD;

        // Avoid null and empty string
        const collName = coll.contract_name || undefined;
        const description = nftData.description || undefined;
        const imageUrl = nftData.image_uri || undefined;
        const contentUrl = nftData.content_uri || undefined;
        const tpUri = nftData.nftscan_uri || undefined;
        const externalUrl = nftData.external_link || undefined;

        const contentType =
          existing?.contentType ||
          parseContentType(nftData?.content_type ?? undefined);

        const metadata: Partial<AccountNFT> = {
          contractAddress,
          tokenId,
          name: existing?.name || nftData?.name || `#${tokenId}`,
          description: existing?.description || description,
          thumbnailUrl:
            existing?.thumbnailUrl ||
            sanitizeUrl(
              tpUri ||
                imageUrl ||
                (contentType === "image_url" ? contentUrl : undefined),
            ),
          contentUrl:
            existing?.contentUrl ||
            sanitizeUrl(contentUrl ?? imageUrl ?? tpUri),
          contentType,
          collectionId: existing?.collectionId,
          collectionName: existing?.collectionName || collName,
          detailUrl: existing?.detailUrl || externalUrl,
          attributes:
            existing?.attributes ??
            (nftData?.attributes?.filter(Boolean) as any),
          priceUSD,
          tpId: nftData.nftscan_id,
        };

        const status = getNextStatus(existing, rawBalanceBN, metadata);
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

    if (
      existingTokensMap.size > 0 &&
      // Avoid fetch balance from chain for huge amount of NFTs
      existingTokensMap.size < 50
    ) {
      const restTokens = Array.from(existingTokensMap.values());

      const balances = await Promise.all(
        restTokens.map(({ tokenSlug }) =>
          getBalanceFromChain(chainId, tokenSlug, accountAddress),
        ),
      );

      for (let i = 0; i < restTokens.length; i++) {
        const rawBalanceBN = balances[i];
        if (rawBalanceBN === null) continue;

        const token = restTokens[i];
        const rawBalance = rawBalanceBN.toString();
        const status = getNextStatus(token, rawBalance, token);

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
  existing: AccountToken | undefined,
  rawBalanceBN: BigNumber.Value,
  metadata: Partial<AccountNFT>,
): TokenStatus {
  if (!existing?.manuallyStatusChanged && !isNFTValid(metadata)) {
    return TokenStatus.Disabled;
  } else if (!existing) {
    // The new token, just add it
    return TokenStatus.Enabled;
  } else if (
    !existing.manuallyStatusChanged &&
    new BigNumber(rawBalanceBN).isZero()
  ) {
    // Balance changed from positive to zero
    return TokenStatus.Disabled;
  } else if (
    !existing.manuallyStatusChanged &&
    new BigNumber(existing.rawBalance).isZero() &&
    new BigNumber(rawBalanceBN).isGreaterThan(0)
  ) {
    // Balance changed from zero to positive
    return TokenStatus.Enabled;
  } else {
    // Existing token, rest cases
    return existing.status;
  }
}

function isNFTValid({ name, description }: Partial<AccountNFT>) {
  for (const text of [name, description]) {
    if (!text) continue;

    const textLowered = text.toLowerCase();
    const invalid = ["airdrop", "reward", "voucher"].some((word) =>
      textLowered.includes(word),
    );

    if (invalid) return false;
  }

  return true;
}

// export async function syncWithCIndexer() {
//   for (const coll of freshAccTokensData) {
//     if (!coll.nft_data?.length) continue;

//     const contractAddress = ethers.getAddress(coll.contract_address);
//     const balanceOne = coll.nft_data.length === +coll.balance;
//     const standard = coll.supports_erc?.includes("erc1155")
//       ? TokenStandard.ERC1155
//       : TokenStandard.ERC721;

//     for (const nftData of coll.nft_data) {
//       const tokenId = String(nftData.token_id);
//       const tokenSlug = createTokenSlug({
//         standard,
//         address: contractAddress,
//         id: tokenId,
//       });

//       const existing = existingTokensMap.get(tokenSlug) as AccountNFT;

//       // Skip no name tokens
//       if (
//         !existing &&
//         !nftData.external_data?.image &&
//         !nftData.external_data?.asset_url
//       ) {
//         continue;
//       }

//       const rawBalanceBN =
//         balanceOne || standard === TokenStandard.ERC721
//           ? BigInt(1)
//           : await getBalanceFromChain(chainId, tokenSlug, accountAddress);

//       if (!rawBalanceBN || (!existing && rawBalanceBN === 0n)) {
//         continue;
//       }

//       const priceUSD = coll.floor_price_quote
//         ? new BigNumber(coll.floor_price_quote).toString()
//         : existing?.priceUSD;

//       const extData = nftData.external_data;

//       // Avoid null and empty string
//       const collName = coll.contract_name || undefined;
//       const description = extData?.description || undefined;
//       const assetUrl = extData?.asset_url || undefined;
//       const imageUrl = extData?.image || undefined;
//       const animationUrl = extData?.animation_url || undefined;
//       const externalUrl = extData?.external_url || undefined;

//       const contentType =
//         existing?.contentType ||
//         parseContentType(extData?.asset_mime_type ?? undefined);

//       const metadata = {
//         contractAddress,
//         tokenId,
//         name: existing?.name || extData?.name || `#${tokenId}`,
//         description: existing?.description || description,
//         thumbnailUrl:
//           existing?.thumbnailUrl ||
//           sanitizeUrl(
//             imageUrl || (contentType === "image_url" ? assetUrl : undefined),
//           ),
//         contentUrl:
//           existing?.contentUrl ||
//           sanitizeUrl(assetUrl ?? imageUrl ?? animationUrl),
//         contentType,
//         collectionId: existing?.collectionId,
//         collectionName: existing?.collectionName || collName,
//         detailUrl: existing?.detailUrl || externalUrl,
//         attributes:
//           existing?.attributes ?? (extData?.attributes?.filter(Boolean) as any),
//         priceUSD,
//       };

//       const status = getNextStatus(existing, rawBalanceBN);
//       const rawBalance = rawBalanceBN.toString();
//       const balanceUSD = existing?.balanceUSD ?? 0;

//       addToken({
//         ...(existing ?? {
//           chainId,
//           accountAddress,
//           tokenSlug,
//           tokenType: TokenType.NFT,
//         }),
//         // Metadata
//         ...metadata,
//         // Volumes
//         status,
//         rawBalance,
//         balanceUSD,
//       });
//     }
//   }
// }
