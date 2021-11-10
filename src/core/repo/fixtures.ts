import { DEFAULT_NETWORKS } from "fixtures/networks";
import { formatURL } from "core/common";

import { db } from "./schema";
import { networks } from "./helpers";
import { INetwork } from "./types";

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

function mergeNetwork(saved: INetwork, toMerge: INetwork): INetwork {
  const {
    chainTag,
    infoUrl,
    nativeCurrency,
    rpcUrls,
    faucetUrls,
    explorerUrls,
  } = toMerge;

  return {
    ...saved,
    // Override
    chainTag,
    infoUrl,
    nativeCurrency: {
      ...saved.nativeCurrency,
      name: nativeCurrency.name,
    },
    // Merge
    rpcUrls: mergeUrls(saved.rpcUrls, rpcUrls)!,
    faucetUrls: mergeUrls(saved.faucetUrls, faucetUrls),
    explorerUrls: mergeUrls(saved.explorerUrls, explorerUrls),
  };
}

function mergeUrls(base?: string[], toMerge?: string[]) {
  if (base && toMerge) {
    return Array.from(new Set([...base, ...toMerge].map(formatURL)));
  }

  return base ?? toMerge;
}
