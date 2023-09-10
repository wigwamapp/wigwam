import { ethers } from "ethers";

import {
  AUTOGLYPHS_TOKEN_ADDRESS,
  HASHMASKS_TOKEN_ADDRESS,
  LIL_NOUNS_TOKEN_ADDRESS,
  LOOT_TOKEN_ADDRESS,
  NOUNS_TOKEN_ADDRESS,
  PUNKS_DATA_CONTRACT,
  WRAPPED_CRYPTOPUNKS_TOKEN_ADDRESS,
  ZORA_TOKEN_ADDRESS,
} from "../defaults";
import { isAddressMatch } from "../utils";

import { fetchZoraMeta } from "./zora";
import { fetchHashmaskMeta } from "./hashmasks";
import { fetchLootMeta } from "./loot";
import { fetchPunkAttributes } from "./punks";
import { fetchAutoglyphsMeta } from "./autoglyphs";
import { fetchNounAttributes } from "./nouns";

export function fetchOnChainData(
  chainId: number,
  tokenAddress: string,
  tokenId: string,
  provider: ethers.JsonRpcApiProvider,
) {
  if (isAddressMatch(chainId, tokenAddress, AUTOGLYPHS_TOKEN_ADDRESS)) {
    return fetchAutoglyphsMeta(tokenAddress, tokenId, provider);
  }

  if (isAddressMatch(chainId, tokenAddress, HASHMASKS_TOKEN_ADDRESS)) {
    return fetchHashmaskMeta(tokenAddress, tokenId, provider);
  }

  if (
    isAddressMatch(chainId, tokenAddress, NOUNS_TOKEN_ADDRESS) ||
    isAddressMatch(chainId, tokenAddress, LIL_NOUNS_TOKEN_ADDRESS)
  ) {
    return fetchNounAttributes(tokenAddress, tokenId, provider);
  }

  if (
    isAddressMatch(chainId, tokenAddress, WRAPPED_CRYPTOPUNKS_TOKEN_ADDRESS)
  ) {
    const punksDataContract = (PUNKS_DATA_CONTRACT as any)[chainId];
    return fetchPunkAttributes(punksDataContract, tokenId, provider);
  }

  if (isAddressMatch(chainId, tokenAddress, ZORA_TOKEN_ADDRESS)) {
    return fetchZoraMeta(tokenAddress, tokenId, provider);
  }

  if (isAddressMatch(chainId, tokenAddress, LOOT_TOKEN_ADDRESS)) {
    return fetchLootMeta(tokenAddress, tokenId, provider);
  }

  return Promise.resolve({});
}
