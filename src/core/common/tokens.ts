import { Provider } from "@ethersproject/abstract-provider";

import { ERC20__factory, ERC1155__factory, ERC721__factory } from "abi-types";
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
  provider: Provider,
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

const STUB_ADDRESS = "0x0000000000000000000000000000000000000001";
const ERC721_IFACE_ID = "0x80ac58cd";
const ERC1155_IFACE_ID = "0xd9b67a26";

export async function isTokenStandardValid(
  provider: Provider,
  address: string,
  standard: TokenStandard
) {
  switch (standard) {
    case TokenStandard.ERC20:
      {
        try {
          const contract = ERC20__factory.connect(address, provider);

          try {
            const is721 = await contract.supportsInterface(ERC721_IFACE_ID);
            if (is721) return false;

            const is1155 = await contract.supportsInterface(ERC721_IFACE_ID);
            if (is1155) return false;
          } catch {}

          const supply = await contract.totalSupply();

          return !supply.isZero();
        } catch {}
      }
      break;

    case TokenStandard.ERC721:
      {
        const contract = ERC721__factory.connect(address, provider);

        try {
          const is721 = await contract.supportsInterface(ERC721_IFACE_ID);
          if (is721) return is721;
        } catch {}

        try {
          await contract.balanceOf(STUB_ADDRESS);
          return true;
        } catch {}
      }
      break;

    case TokenStandard.ERC1155:
      {
        const contract = ERC1155__factory.connect(address, provider);

        try {
          return await contract.supportsInterface(ERC1155_IFACE_ID);
        } catch {}
      }
      break;
  }

  return false;
}
