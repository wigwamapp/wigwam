import { useMemo } from "react";
import { joinPath } from "lib/system/url";

import { Network } from "core/types";

export function useExplorerLink(network?: Network) {
  const explorerUrl = network?.explorerUrls?.[0];

  return useMemo(
    () =>
      explorerUrl
        ? {
            address: (address: string) =>
              joinPath(explorerUrl, `/address/${address}`),
            tx: (hash: string) => joinPath(explorerUrl, `/tx/${hash}`),
            nft: (address: string, id: string) =>
              joinPath(explorerUrl, `/nft/${address}/${id}`),
          }
        : null,
    [explorerUrl]
  );
}
