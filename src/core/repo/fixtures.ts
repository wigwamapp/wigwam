import { mergeNetworkUrls } from "core/common";
import { Network } from "core/types";

import { DEFAULT_NETWORKS } from "fixtures/networks";

import { db } from "./schema";
import { networks } from "./helpers";

export async function setupFixtures() {
  try {
    await db.transaction("rw", networks, async () => {
      const existingNetworks = await networks.bulkGet(
        DEFAULT_NETWORKS.map((net) => net.chainId)
      );

      const toPut = DEFAULT_NETWORKS.map((net, i) => {
        const existing = existingNetworks[i];
        return existing ? mergeNetwork(existing, net) : net;
      });

      await networks.bulkPut(toPut);
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
