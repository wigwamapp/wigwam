import { useMemo } from "react";
import { joinPath } from "lib/system/url";

import { Network } from "core/types";

export function useExplorerLink(network?: Network) {
  const explorerUrl = network?.explorerUrls?.[0];

  return useMemo(
    () =>
      explorerUrl
        ? {
            lifi: (address: string) => `https://explorer.li.fi/tx/${address}/`,
            address: (address: string) =>
              joinPath(explorerUrl, `/address/${address}`),
            tx: (hash: string) => joinPath(explorerUrl, `/tx/${hash}`),
            token: (address: string) =>
              joinPath(explorerUrl, `/token/${address}`),
            nft: (address: string, id: string) =>
              joinPath(
                explorerUrl,
                network.chainTag === "ethereum"
                  ? `/nft/${address}/${id}`
                  : `/token/${address}`,
              ),
          }
        : null,
    [explorerUrl, network?.chainTag],
  );
}
