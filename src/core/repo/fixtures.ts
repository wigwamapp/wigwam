import { wrapIpfsNetIcon } from "lib/wigwam-static";

import { mergeNetworkUrls } from "core/common";
import { Network } from "core/types";
import { getAllEvmNetworks } from "core/common/chainList";

import { DEFAULT_NETWORKS } from "fixtures/networks";

import { db } from "./schema";
import { networks } from "./helpers";

export async function setupFixtures() {
  try {
    const allEvmNetworks =
      process.env.NODE_ENV !== "test" ? await getAllEvmNetworks() : [];

    await db.transaction("rw", networks, async () => {
      const existingNetworks = await networks.toArray();

      const extNetsMap = new Map(existingNetworks.map((n) => [n.chainId, n]));
      const mainNets: Network[] = [];

      for (const net of DEFAULT_NETWORKS) {
        const existing = extNetsMap.get(net.chainId);

        mainNets.push(existing ? mergeNetwork(existing, net) : net);

        if (existing) extNetsMap.delete(net.chainId);
      }

      await networks.bulkPut(mainNets);

      if (process.env.NODE_ENV === "test") return;

      // Refresh rest
      const allNetsMap = new Map(allEvmNetworks.map((n) => [n.chainId, n]));

      const restNets = Array.from(extNetsMap.values()).map((net) => {
        const evmData = allNetsMap.get(net.chainId);

        // Localhost
        if (net.chainId === 1337) return net;

        // Manually changed
        // TODO: Better to merge
        if (net.manuallyChanged) return net;

        return evmData
          ? mergeNetwork(net, {
              chainId: evmData.chainId,
              type: evmData.testnet ? "testnet" : "unknown",
              chainTag: "",
              rpcUrls: evmData.rpcUrls.filter((url) => url.startsWith("http")),
              name: evmData.name,
              nativeCurrency: evmData.nativeCurrency,
              explorerUrls: evmData.explorers?.map((exp) => exp.url),
              explorerApiUrl: evmData.explorers?.find((exp) => exp.apiUrl)
                ?.apiUrl,
              faucetUrls: evmData.faucets,
              iconUrls: evmData.icon && [wrapIpfsNetIcon(evmData.icon.url)],
              infoUrl: evmData.infoUrl,
              position: 0,
            })
          : net;
      });

      await networks.bulkPut(restNets);
    });
  } catch (err) {
    console.error(err);
  }
}

function mergeNetwork(saved: Network, toMerge: Network): Network {
  return {
    ...saved,
    // Override
    ...toMerge,
    // Merge
    rpcUrls: mergeNetworkUrls(saved.rpcUrls, toMerge.rpcUrls)!,
    explorerUrls: mergeNetworkUrls(saved.explorerUrls, toMerge.explorerUrls),
  };
}
