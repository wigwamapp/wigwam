import memoize from "mem";
import axios from "axios";
import retry from "async-retry";
import { props } from "lib/system/promise";

import { ERC20__factory, ERC721__factory, ERC1155__factory } from "abi-types";
import { parseTokenSlug } from "core/common/tokens";
import { requestBalance } from "core/common/balance";

import { NFT, NFTContentType, TokenStandard } from "core/types";

import { getRpcProvider } from "../rpc";
import { ethers } from "ethers";

export const getAccountTokenFromChain = async (
  chainId: number,
  tokenSlug: string
) => {
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

      case TokenStandard.ERC721: {
        const contract = ERC721__factory.connect(tokenAddress, provider);

        try {
          const { collectionName, tokenUri } = await retry(
            () =>
              props({
                collectionName: contract.name(),
                tokenUri: contract.tokenURI(tokenId),
              }),
            { retries: 2 }
          );

          const base: Partial<NFT> = {
            contractAddress: tokenAddress,
            tokenId,
            name: `${collectionName} #${tokenId}`,
            collectionName,
            collectionId: slugify(collectionName),
          };

          const meta = await retry(
            () =>
              axios
                .get(tokenUri, { timeout: 30_000 })
                .then((r) => r.data)
                .catch(() => null),
            { retries: 2 }
          );

          if (!meta) return base;

          const { name, description, image, external_url, attributes } =
            meta.properties;

          let contentType: NFTContentType | undefined;
          if (external_url) {
            contentType = (await fetchContentType(external_url)) ?? undefined;
          }

          return {
            ...base,
            name,
            description,
            thumbnailUrl: image,
            detailUrl: external_url,
            contentType,
            attributes,
          };
        } catch {
          return {
            tokenAddress,
            tokenId,
            name: `#${tokenId}`,
          };
        }
      }

      case TokenStandard.ERC1155: {
        const contract = ERC1155__factory.connect(tokenAddress, provider);

        try {
          let tokenUri = await retry(() => contract.uri(tokenId), {
            retries: 2,
          });

          if (tokenUri.includes("{id}")) {
            const serealizedTokenId = ethers.utils
              .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
              .slice(2);

            tokenUri = tokenUri.replace(/{id}/g, serealizedTokenId);
          }

          const base: Partial<NFT> = {
            contractAddress: tokenAddress,
            tokenId,
            name: `#${tokenId}`,
          };

          const meta = await retry(
            () =>
              axios
                .get(tokenUri, { timeout: 30_000 })
                .then((r) => r.data)
                .catch(() => null),
            { retries: 2 }
          );

          if (!meta) return base;

          const { name, description, image, external_url, attributes } =
            meta.properties;

          let contentType: NFTContentType | undefined;
          if (external_url) {
            contentType = (await fetchContentType(external_url)) ?? undefined;
          }

          return {
            ...base,
            name,
            description,
            thumbnailUrl: image,
            detailUrl: external_url,
            contentType,
            attributes,
          };
        } catch {
          return {
            tokenAddress,
            tokenId,
            name: `#${tokenId}`,
          };
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

function slugify(text: string) {
  return text
    .toString() // Cast to string (optional)
    .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/\-$/g, ""); // Remove trailing -
}

function fetchContentType(url: string) {
  return new Promise<NFTContentType | null>((res) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 30_000;
    xhr.open("HEAD", url, true);

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader("Content-Type");
      res(contentType ? parseContentType(contentType) : null);
    };

    xhr.onerror = () => res(null);

    xhr.send();
  });
}

function parseContentType(contentType: string): NFTContentType | null {
  if (contentType.includes("image")) return "image_url";
  if (contentType.includes("video")) return "video_url";
  if (contentType.includes("audio")) return "audio_url";

  return null;
}
