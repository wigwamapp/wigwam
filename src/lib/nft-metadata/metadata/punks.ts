import { ethers } from "ethers";

// This properly encodes the svg data uri for punks
// from: spectrexyz/use-nft
function encodeUriData(dataUri: string): string {
  const dataStart = dataUri.indexOf(",") + 1;
  return (
    dataUri.slice(0, dataStart) +
      encodeURIComponent(dataUri.slice(dataStart)) || ""
  );
}

export async function fetchPunkAttributes(
  punksDataContract: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  const PunksDataContract = new ethers.Contract(
    punksDataContract,
    [
      "function punkAttributes(uint16 index) public view returns (string memory)",
      "function punkImageSvg(uint16 index) public view returns (string memory)",
    ],
    provider,
  );
  const [type, ...accessories] = (
    await PunksDataContract.punkAttributes(tokenId)
  ).split(",");
  const imageRaw = await PunksDataContract.punkImageSvg(tokenId);

  return {
    image: encodeUriData(imageRaw),
    attributes: [
      { trait_type: "Type", value: type },
      ...accessories.map((accessory: string) => ({
        trait_type: "Accessory",
        value: accessory,
      })),
    ],
  };
}
