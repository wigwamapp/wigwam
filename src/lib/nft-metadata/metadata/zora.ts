import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";

export async function fetchZoraMeta(
  tokenAddress: string,
  tokenId: string,
  provider: JsonRpcProvider,
) {
  const { default: zoraMediaAbi } = await import("../abi/zoraMedia.json");

  const zoraMediaContract = new Contract(tokenAddress, zoraMediaAbi, provider);

  const contentURL = await zoraMediaContract.tokenURI(tokenId);

  return {
    contentURL,
  };
}
