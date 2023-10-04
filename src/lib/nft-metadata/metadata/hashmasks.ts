import { ethers } from "ethers";

export async function fetchHashmaskMeta(
  tokenAddress: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  const HMContract = new ethers.Contract(
    tokenAddress,
    [
      "function tokenNameByIndex(uint256 index) public view returns (string memory)",
    ],
    provider,
  );
  const name = await HMContract.tokenNameByIndex(tokenId);
  return {
    name,
  };
}
