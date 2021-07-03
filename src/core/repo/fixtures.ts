import { DEFAULT_NETWORKS } from "fixtures/networks";
import { formatURL } from "core/helpers";

import { db, networks } from "./schema";

export async function setupFixtures() {
  try {
    await db.transaction("rw", networks, async () => {
      for (const net of DEFAULT_NETWORKS) {
        const existing = await networks.get(net.chainId);
        if (existing) {
          await networks.where({ chainId: net.chainId }).modify((extNet) => {
            const rpcURLSet = new Set(
              [...net.rpcURLs, ...extNet.rpcURLs].map(formatURL)
            );
            extNet.rpcURLs = Array.from(rpcURLSet);
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
