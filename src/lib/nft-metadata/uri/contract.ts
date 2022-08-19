import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";

import { isAddressMatch } from "../utils";
import { ZORA_TOKEN_ADDRESS } from "../defaults";

export async function getAlternateContractCall(
  chainId: number,
  tokenAddress: string,
  tokenId: string,
  provider: JsonRpcProvider
) {
  if (isAddressMatch(chainId, tokenAddress, ZORA_TOKEN_ADDRESS)) {
    const { default: zoraMediaAbi } = await import("../abi/zoraMedia.json");

    const zoraMediaContract = new Contract(
      tokenAddress,
      zoraMediaAbi,
      provider
    );

    return {
      type: "ERC721",
      uri: await zoraMediaContract.tokenMetadataURI(tokenId),
    };
  }

  return;
}
