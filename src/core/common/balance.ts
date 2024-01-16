import { ethers } from "ethers";
import { ERC20__factory, ERC721__factory, ERC1155__factory } from "abi-types";

import { TokenStandard } from "core/types";

import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "./tokens";

export async function requestBalance(
  provider: ethers.Provider,
  tokenSlug: string,
  accountAddress: string,
) {
  if (tokenSlug === NATIVE_TOKEN_SLUG) {
    return await provider.getBalance(accountAddress);
  } else {
    const { standard, address, id } = parseTokenSlug(tokenSlug);

    switch (standard) {
      case TokenStandard.ERC20: {
        const contract = ERC20__factory.connect(address, provider);

        return await contract.balanceOf(accountAddress);
      }

      case TokenStandard.ERC721: {
        const contract = ERC721__factory.connect(address, provider);
        const owner = await contract.ownerOf(id);

        return ethers.getAddress(owner) === accountAddress ? 1n : 0n;
      }

      case TokenStandard.ERC1155: {
        const contract = ERC1155__factory.connect(address, provider);

        return await contract.balanceOf(accountAddress, id);
      }

      default:
        throw new Error("Unhandled Token ERC standard");
    }
  }
}
