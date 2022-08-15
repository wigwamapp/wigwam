import { useEffect } from "react";
import { storage } from "lib/ext/storage";

import { AccountNFT } from "core/types";
import { findToken } from "core/client";

export function useAutoRefreshNftMetadata(tokenInfo?: AccountNFT) {
  useEffect(() => {
    if (tokenInfo && !tokenInfo.thumbnailUrl) {
      const { chainId, accountAddress, tokenSlug } = tokenInfo;

      (async () => {
        const storageKey = [
          "nft_metadata_refresh_tried",
          chainId,
          tokenSlug,
        ].join("_");

        const tried = await storage.fetchForce<boolean>(storageKey);
        if (!tried) {
          await storage.put(storageKey, true);
          findToken(chainId, accountAddress, tokenSlug, true);
        }
      })();
    }
  }, [tokenInfo]);
}
