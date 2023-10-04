import { ethers } from "ethers";

export async function fetchZoraMeta(
  tokenAddress: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  const { default: zoraMediaAbi } = await import("../abi/zoraMedia.json");

  const zoraMediaContract = new ethers.Contract(
    tokenAddress,
    zoraMediaAbi,
    provider,
  );

  const contentURL = await zoraMediaContract.tokenURI(tokenId);

  return {
    contentURL,
  };
}
