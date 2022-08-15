import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";

export async function fetchHashmaskMeta(
  tokenAddress: string,
  tokenId: string,
  provider: JsonRpcProvider
) {
  const HMContract = new Contract(
    tokenAddress,
    [
      "function tokenNameByIndex(uint256 index) public view returns (string memory)",
    ],
    provider
  );
  const name = await HMContract.tokenNameByIndex(tokenId);
  return {
    name,
  };
}
