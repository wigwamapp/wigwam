import memoize from "mem";
import retry from "async-retry";
import { props } from "lib/system/promise";
import { slugify } from "lib/system/slugify";
import { NFTMetadataAgent } from "lib/nft-metadata";

import { ERC20__factory, ERC721__factory } from "abi-types";
import { parseTokenSlug } from "core/common/tokens";
import { requestBalance } from "core/common/balance";

import { NFT, TokenStandard } from "core/types";

import { parseContentType } from "./utils";
import { getRpcProvider } from "../rpc";

export const getTokenMetadata = async (
  chainId: number,
  tokenSlug: string,
  returnBroken = false,
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
          { retries: 2 },
        );
      }

      case TokenStandard.ERC721:
      case TokenStandard.ERC1155: {
        const agent = new NFTMetadataAgent(chainId, provider);
        const [contractName, parsed] = await Promise.all([
          standard === TokenStandard.ERC721
            ? ERC721__factory.connect(tokenAddress, provider)
                .name()
                .catch(() => null)
            : null,
          agent.fetchMetadata(tokenAddress, tokenId).catch(() => null),
        ]);

        if (!returnBroken && !parsed) {
          return null;
        }

        const metadata: Partial<NFT> = omitEmptyFields({
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
        });

        return metadata;
      }

      default:
        throw new Error("Unhandled Token ERC standard");
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
      () => null,
    );
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 3_000,
  },
);

function omitEmptyFields<T extends Record<string, any>>(obj: T): T {
  const newObj = { ...obj };
  for (const key in obj) {
    const val = obj[key];
    if (val) newObj[key] = val;
  }
  return newObj;
}
