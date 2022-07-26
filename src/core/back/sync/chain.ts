import memoize from "mem";
import retry from "async-retry";
import { props } from "lib/system/promise";
import { slugify } from "lib/system/slugify";
import { NFTMetadataAgent } from "lib/nft-metadata";

import { ERC20__factory, ERC721__factory } from "abi-types";
import { parseTokenSlug } from "core/common/tokens";
import { requestBalance } from "core/common/balance";

import { NFT, NFTContentType, TokenStandard } from "core/types";

import { getRpcProvider } from "../rpc";

export const getTokenMetadata = async (chainId: number, tokenSlug: string) => {
  const provider = getRpcProvider(chainId);

  const {
    standard,
    address: tokenAddress,
    id: tokenId,
  } = parseTokenSlug(tokenSlug);

  try {
    switch (standard) {
      case TokenStandard.ERC20: {
        const contract = ERC20__factory.connect(tokenAddress, provider);

        return await retry(
          () =>
            props({
              decimals: contract.decimals(),
              symbol: contract.symbol(),
              name: contract.name(),
            }),
          { retries: 2 }
        );
      }

      case TokenStandard.ERC721:
      case TokenStandard.ERC1155: {
        const agent = new NFTMetadataAgent(chainId, provider);
        const [contractName, parsed] = await Promise.all([
          standard === TokenStandard.ERC721
            ? ERC721__factory.connect(tokenAddress, provider).name()
            : null,
          agent.fetchMetadata(tokenAddress, tokenId).catch(() => null),
        ]);

        const metadata: Partial<NFT> = {
          contractAddress: tokenAddress,
          tokenId: tokenId,
          name:
            parsed?.name ??
            `${contractName ? `${contractName} ` : ""}#${tokenId}`,
          collectionName: contractName ?? undefined,
          collectionId: contractName ? slugify(contractName) : undefined,
          description: parsed?.description,
          thumbnailUrl: parsed?.imageURL,
          contentUrl: parsed?.contentURL,
          detailUrl: parsed?.externalURL,
          contentType: parseContentType(parsed?.contentURLMimeType),
          attributes: parsed?.attributes as any,
        };

        if (metadata.thumbnailUrl) {
          return metadata;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  return null;
};

export const getBalanceFromChain = memoize(
  async (chainId: number, tokenSlug: string, accountAddress: string) => {
    const provider = getRpcProvider(chainId);

    return requestBalance(provider, tokenSlug, accountAddress).catch(
      () => null
    );
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 3_000,
  }
);

function parseContentType(contentType?: string): NFTContentType | undefined {
  if (contentType?.includes("image")) return "image_url";
  if (contentType?.includes("video")) return "video_url";
  if (contentType?.includes("audio")) return "audio_url";

  return;
}

// async function legacy() {
//   switch (standard) {
//     case TokenStandard.ERC721: {
//       const contract = ERC721__factory.connect(tokenAddress, provider);

//       try {
//         const { collectionName, tokenUri } = await retry(
//           () =>
//             props({
//               collectionName: contract.name(),
//               tokenUri: contract.tokenURI(tokenId),
//             }),
//           { retries: 2 }
//         );

//         const base: Partial<NFT> = {
//           contractAddress: tokenAddress,
//           tokenId,
//           name: `${collectionName} #${tokenId}`,
//           collectionName,
//           collectionId: slugify(collectionName),
//         };

//         const meta = await retry(
//           () =>
//             axios
//               .get(tokenUri, { timeout: 30_000 })
//               .then((r) => r.data)
//               .catch(() => null),
//           { retries: 2 }
//         );

//         if (!meta) return base;

//         const { name, description, image, external_url, attributes } =
//           meta.properties;

//         let contentType: NFTContentType | undefined;
//         if (external_url) {
//           contentType = (await fetchContentType(external_url)) ?? undefined;
//         }

//         return {
//           ...base,
//           name,
//           description,
//           thumbnailUrl: image,
//           detailUrl: external_url,
//           contentType,
//           attributes,
//         };
//       } catch {
//         return {
//           tokenAddress,
//           tokenId,
//           name: `#${tokenId}`,
//         };
//       }
//     }

//     case TokenStandard.ERC1155: {
//       const contract = ERC1155__factory.connect(tokenAddress, provider);

//       try {
//         let tokenUri = await retry(() => contract.uri(tokenId), {
//           retries: 2,
//         });

//         if (tokenUri.includes("{id}")) {
//           const serealizedTokenId = ethers.utils
//             .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
//             .slice(2);

//           tokenUri = tokenUri.replace(/{id}/g, serealizedTokenId);
//         }

//         const base: Partial<NFT> = {
//           contractAddress: tokenAddress,
//           tokenId,
//           name: `#${tokenId}`,
//         };

//         const meta = await retry(
//           () =>
//             axios
//               .get(tokenUri, { timeout: 30_000 })
//               .then((r) => r.data)
//               .catch(() => null),
//           { retries: 2 }
//         );

//         if (!meta) return base;

//         const { name, description, image, external_url, attributes } =
//           meta.properties;

//         let contentType: NFTContentType | undefined;
//         if (external_url) {
//           contentType = (await fetchContentType(external_url)) ?? undefined;
//         }

//         return {
//           ...base,
//           name,
//           description,
//           thumbnailUrl: image,
//           detailUrl: external_url,
//           contentType,
//           attributes,
//         };
//       } catch {
//         return {
//           tokenAddress,
//           tokenId,
//           name: `#${tokenId}`,
//         };
//       }
//     }
//   }
// }

// function fetchContentType(url: string) {
//   return new Promise<NFTContentType | null>((res) => {
//     const xhr = new XMLHttpRequest();
//     xhr.timeout = 30_000;
//     xhr.open("HEAD", url, true);

//     xhr.onload = () => {
//       const contentType = xhr.getResponseHeader("Content-Type");
//       res(contentType ? parseContentType(contentType) : null);
//     };

//     xhr.onerror = () => res(null);

//     xhr.send();
//   });
// }
