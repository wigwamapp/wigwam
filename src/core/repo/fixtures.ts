import { formatRpcUrl } from "core/common";
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
  const {
    name,
    chainTag,
    infoUrl,
    nativeCurrency,
    rpcUrls,
    faucetUrls,
    explorerUrls,
    position,
  } = toMerge;

  return {
    ...saved,
    // Override
    name,
    chainTag,
    infoUrl,
    nativeCurrency: {
      ...saved.nativeCurrency,
      name: nativeCurrency.name,
    },
    position,
    // Merge
    rpcUrls: mergeUrls(saved.rpcUrls, rpcUrls)!,
    faucetUrls: mergeUrls(saved.faucetUrls, faucetUrls),
    explorerUrls: mergeUrls(saved.explorerUrls, explorerUrls),
  };
}

function mergeUrls(base?: string[], toMerge?: string[]) {
  if (base && toMerge) {
    return Array.from(new Set([...toMerge, ...base].map(formatRpcUrl)));
  }

  return base ?? toMerge;
}
