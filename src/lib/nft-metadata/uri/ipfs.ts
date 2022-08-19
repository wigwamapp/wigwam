import { isAddressMatch, getCID, convertToDesiredGateway } from "../utils";
import {
  FOUNDATION_TOKEN_ADDRESS,
  MAKERSPLACE_TOKEN_ADDRESS,
  ZORA_TOKEN_ADDRESS,
} from "../defaults";

export { convertToDesiredGateway };

export function isIPFS(uri: string) {
  return !!getCID(uri);
}

export function getIPFSUrl(uri: string, gateway: string) {
  if (getCID(uri)) {
    return convertToDesiredGateway(uri, gateway);
  }
  return uri;
}

export function getPrivateGateway(chainId: number, tokenAddress: string) {
  if (isAddressMatch(chainId, tokenAddress, MAKERSPLACE_TOKEN_ADDRESS)) {
    return "https://ipfsgateway.makersplace.com";
  }
  if (isAddressMatch(chainId, tokenAddress, FOUNDATION_TOKEN_ADDRESS)) {
    return "https://ipfs.foundation.app";
  }
  if (isAddressMatch(chainId, tokenAddress, ZORA_TOKEN_ADDRESS)) {
    return "https://zora-prod.mypinata.cloud";
  }
  return;
}
