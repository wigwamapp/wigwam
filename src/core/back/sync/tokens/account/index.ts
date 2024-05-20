import { TokenType } from "core/types";

import { syncAccountAssets } from "./assets";
import { syncAccountNFTs } from "./nfts";

export function syncAccountTokens(
  tokenType: TokenType,
  chainId: number,
  accountAddress: string,
) {
  const sync =
    tokenType === TokenType.Asset ? syncAccountAssets : syncAccountNFTs;

  return sync(chainId, accountAddress);
}
