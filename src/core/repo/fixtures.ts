import { DEFAULT_NETWORKS } from "fixtures/networks";
import { formatURL } from "core/common";

import { db } from "./schema";
import { networks } from "./helpers";

export async function setupFixtures() {
  try {
    await db.transaction("rw", networks, async () => {
      for (const net of DEFAULT_NETWORKS) {
        const existing = await networks.get(net.chainId);
        if (existing) {
          await networks.where({ chainId: net.chainId }).modify((extNet) => {
            const rpcUrlSet = new Set(
              [...net.rpcUrls, ...extNet.rpcUrls].map(formatURL)
            );
            extNet.rpcUrls = Array.from(rpcUrlSet);
          });
        } else {
          await networks.add(net);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}
