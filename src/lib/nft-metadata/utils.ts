import { ethers } from "ethers";
import { CID } from "multiformats/cid";

export function serealizeTokenId1155(tokenId: string) {
  return ethers.utils
    .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
    .slice(2);
}

export function isAddressMatch(
  chainId: number,
  address: string,
  addressByNetwork: { [chainId: number]: string }
) {
  if (!addressByNetwork[chainId]) return false;

  return (
    ethers.utils.getAddress(address) ===
    ethers.utils.getAddress(addressByNetwork[chainId])
  );
}

export function convertToDesiredGateway(
  sourceUrl: string,
  desiredGatewayPrefix: string
) {
  const cid = getCID(sourceUrl);
  if (!cid) {
    throw new Error("url does not contain CID");
  }

  const splitUrl = sourceUrl.split(cid);

  if (isCID(cid)) {
    return `${desiredGatewayPrefix}/ipfs/${cid}${splitUrl[1]}`;
  }

  // Case 1 - the ipfs://cid path
  if (sourceUrl.includes(`ipfs://${cid}`)) {
    return `${desiredGatewayPrefix}/ipfs/${cid}${splitUrl[1]}`;
  }

  // Case 2 - the /ipfs/cid path (this should cover ipfs://ipfs/cid as well
  if (sourceUrl.includes(`/ipfs/${cid}`)) {
    return `${desiredGatewayPrefix}/ipfs/${cid}${splitUrl[1]}`;
  }

  // Case 3 - the /ipns/cid path
  if (sourceUrl.includes(`/ipns/${cid}`)) {
    return `${desiredGatewayPrefix}/ipns/${cid}${splitUrl[1]}`;
  }

  // This is the fallback if no supported patterns are provided
  throw new Error("Unsupported IPFS URL pattern");
}

export function getCID(url: string) {
  const parts = url.split("/");

  for (const part of parts) {
    if (isCID(part)) {
      return part;
    }

    const dotPart = part.split(".")[0];
    if (isCID(dotPart)) {
      return dotPart;
    }
  }

  return null;
}

function isCID(hash: any) {
  try {
    if (typeof hash === "string") {
      return Boolean(CID.parse(hash));
    }

    if (hash instanceof Uint8Array) {
      return Boolean(CID.decode(hash));
    }

    return Boolean(CID.asCID(hash));
  } catch {
    return false;
  }
}
