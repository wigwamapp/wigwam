import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";

export async function fetchLootMeta(
  tokenAddress: string,
  tokenId: string,
  provider: JsonRpcProvider
) {
  const { default: lootAbi } = await import("../abi/loot.json");

  const lootContract = new Contract(tokenAddress, lootAbi, provider);

  const [chest, foot, hand, neck, ring, waist, weapon] = await Promise.all([
    lootContract.getChest(tokenId),
    lootContract.getFoot(tokenId),
    lootContract.getHand(tokenId),
    lootContract.getHead(tokenId),
    lootContract.getNeck(tokenId),
    lootContract.getRing(tokenId),
    lootContract.getWaist(tokenId),
    lootContract.getWeapon(tokenId),
  ]);

  return {
    attributes: [
      { trait_type: "Chest", value: chest },
      { trait_type: "Foot", value: foot },
      { trait_type: "Hand", value: hand },
      { trait_type: "Neck", value: neck },
      { trait_type: "Ring", value: ring },
      { trait_type: "Waist", value: waist },
      { trait_type: "Weapon", value: weapon },
    ],
  };
}
