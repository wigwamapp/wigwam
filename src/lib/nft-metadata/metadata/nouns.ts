import { ethers } from "ethers";

import { LIL_NOUNS_TOKEN_ADDRESS } from "../defaults";

function cleanupValue(value: string) {
  return value.replace(/-/g, " ");
}

// works for lil and normal nouns for now
export async function fetchNounAttributes(
  nounsContract: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  const { default: data } = await import("../defaults/nounsData");

  const NounsTokenContract = new ethers.Contract(
    nounsContract,
    [
      "function seeds(uint256 tokenId) public view returns (uint48,uint48,uint48,uint48,uint48)",
    ],
    provider,
  );

  const [background, body, accessory, head, glasses] =
    await NounsTokenContract.seeds(tokenId);

  const attributes = {
    background: cleanupValue(data.background[background]),
    body: cleanupValue(data.body[body]),
    accessory: cleanupValue(data.accessory[accessory]),
    head: cleanupValue(data.head[head]),
    glasses: cleanupValue(data.glasses[glasses]),
  };

  const updates: any = {};
  if (nounsContract === LIL_NOUNS_TOKEN_ADDRESS[1]) {
    updates["name"] = `Lil Noun ${tokenId}`;
  }

  return {
    ...updates,
    attributes: [
      ...Object.keys(attributes).map((attr: string) => ({
        trait_type: attr,
        value: (attributes as any)[attr],
      })),
    ],
  };
}
