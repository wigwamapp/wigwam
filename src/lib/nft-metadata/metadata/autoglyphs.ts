import { ethers } from "ethers";

const SCHEME_MAP: Record<number, string> = {
  1: " X/\\",
  2: "+-|",
  3: "/\\",
  4: "|-/",
  5: "O|-",
  6: "\\",
  7: "#|-+",
  8: "OO",
  9: "#",
  10: "#O",
};

export async function fetchAutoglyphsMeta(
  tokenAddress: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  const GlyphsContract = new ethers.Contract(
    tokenAddress,
    ["function symbolScheme(uint256 index) public view returns (uint8)"],
    provider,
  );
  const scheme = await GlyphsContract.symbolScheme(tokenId);

  return {
    properties: {
      "Symbol Scheme": SCHEME_MAP[scheme] || "Unknown",
    },
  };
}
