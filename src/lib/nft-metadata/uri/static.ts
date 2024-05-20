import {
  AUTOGLYPHS_TOKEN_ADDRESS,
  DECENTRALAND_TOKEN_ADDRESS,
  ENS_TOKEN_ADDRESS,
  FOUNDATION_TOKEN_ADDRESS,
  HASHMASKS_TOKEN_ADDRESS,
  WRAPPED_CRYPTOPUNKS_TOKEN_ADDRESS,
} from "../defaults";
import { isAddressMatch } from "../utils";

export function getStaticURI(
  chainId: number,
  tokenAddress: string,
  tokenId: string,
) {
  if (isAddressMatch(chainId, tokenAddress, DECENTRALAND_TOKEN_ADDRESS)) {
    return {
      type: "ERC721",
      uri: `https://api.decentraland.org/v2/contracts/${tokenAddress.toLowerCase()}/tokens/${tokenId}`,
    };
  }

  if (isAddressMatch(chainId, tokenAddress, HASHMASKS_TOKEN_ADDRESS)) {
    return {
      type: "ERC721",
      uri: `https://hashmap.azurewebsites.net/getMask/${tokenId}`,
    };
  }

  if (isAddressMatch(chainId, tokenAddress, ENS_TOKEN_ADDRESS)) {
    let ensChainName = "mainnet";
    if (chainId === 3) ensChainName = "ropsten";
    if (chainId === 4) ensChainName = "rinkeby";

    return {
      type: "ERC721",
      uri: `https://metadata.ens.domains/${ensChainName}/${tokenAddress.toLowerCase()}/${tokenId}/`,
    };
  }

  if (isAddressMatch(chainId, tokenAddress, FOUNDATION_TOKEN_ADDRESS)) {
    return {
      type: "ERC721",
      uri: `https://api.foundation.app/opensea/${tokenId}`,
    };
  }

  if (
    isAddressMatch(chainId, tokenAddress, WRAPPED_CRYPTOPUNKS_TOKEN_ADDRESS)
  ) {
    return {
      type: "ERC721",
      uri: `data:application/json,{}`,
    };
  }

  return;
}

export function getURIData(
  chainId: number,
  tokenAddress: string,
  tokenId: string,
) {
  if (
    isAddressMatch(chainId, tokenAddress, WRAPPED_CRYPTOPUNKS_TOKEN_ADDRESS)
  ) {
    return Promise.resolve({
      title: `W#${tokenId}`,
      name: `W#${tokenId}`,
      description:
        "This Punk was wrapped using Wrapped Punks contract, accessible from https://wrappedpunks.com",
      external_url: `https://larvalabs.com/cryptopunks/details/${tokenId}`,
    });
  }

  if (isAddressMatch(chainId, tokenAddress, AUTOGLYPHS_TOKEN_ADDRESS)) {
    return Promise.resolve({
      title: `Autoglyph #${tokenId}`,
      name: `Autoglyph #${tokenId}`,
      image: `https://www.larvalabs.com/autoglyphs/glyphimage?index=${tokenId}`,
      description:
        "Autoglyphs are the first “on-chain” generative art on the Ethereum blockchain. A completely self-contained mechanism for the creation and ownership of an artwork.",
      external_url: `https://www.larvalabs.com/autoglyphs/glyph?index=${tokenId}`,
    });
  }

  return;
}
