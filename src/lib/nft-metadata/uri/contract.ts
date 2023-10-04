import { ethers } from "ethers";

import { isAddressMatch } from "../utils";
import { ZORA_TOKEN_ADDRESS } from "../defaults";

export async function getAlternateContractCall(
  chainId: number,
  tokenAddress: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  if (isAddressMatch(chainId, tokenAddress, ZORA_TOKEN_ADDRESS)) {
    const { default: zoraMediaAbi } = await import("../abi/zoraMedia.json");

    const zoraMediaContract = new ethers.Contract(
      tokenAddress,
      zoraMediaAbi,
      provider,
    );

    return {
      type: "ERC721",
      uri: await zoraMediaContract.tokenMetadataURI(tokenId),
    };
  }

  return;
}
