import { JsonRpcProvider } from "@ethersproject/providers";

import { ERC1155__factory } from "abi-types";
import { TokenActivity, TokenStandard } from "core/types";

export const NATIVE_TOKEN_SLUG = createTokenSlug({
  standard: TokenStandard.Native,
  address: "0",
  id: "0",
});

export type ParsedTokenSlug = {
  standard: TokenStandard;
  address: string;
  id: string;
};

export function createTokenSlug({ standard, address, id }: ParsedTokenSlug) {
  return `${standard}_${address}_${id}`;
}

export function createERC20TokenSlug(address: string) {
  return createTokenSlug({
    standard: TokenStandard.ERC20,
    address,
    id: "0",
  });
}

export function parseTokenSlug(slug: string) {
  const [standard, address, id] = slug.split("_");

  return { standard, address, id } as ParsedTokenSlug;
}

export function createAccountTokenKey({
  chainId,
  accountAddress,
  tokenSlug,
}: {
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
}) {
  return `${chainId}_${accountAddress}_${tokenSlug}`;
}

export function createTokenActivityKey({
  accountAddress,
  tokenSlug,
  txHash,
  anotherAddress,
}: TokenActivity) {
  return `${accountAddress}_${tokenSlug}_${txHash}_${anotherAddress}`;
}

export function getNativeTokenLogoUrl(chainTag: string) {
  return `{{native}}/${chainTag}`;
}

export async function detectNFTStandard(
  provider: JsonRpcProvider,
  tokenAddress: string,
  tokenId: string
) {
  try {
    const erc1155Contract = ERC1155__factory.connect(tokenAddress, provider);
    await erc1155Contract.uri(tokenId);

    return TokenStandard.ERC1155;
  } catch {}

  return TokenStandard.ERC721;
}
