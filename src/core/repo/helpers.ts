import { DEFAULT_NETWORKS } from "fixtures/networks";

import { INetwork, IAccount } from "./types";
import { db, Table } from "./schema";

export const networks = db.table<INetwork, number>(Table.Networks);
export const accounts = db.table<IAccount, string>(Table.Accounts);

export async function setupFixtures() {
  try {
    await db.transaction("rw", networks, async () => {
      for (const net of DEFAULT_NETWORKS) {
        const existing = await networks.get(net.chainId);
        if (existing) {
          await networks.where({ chainId: net.chainId }).modify((extNet) => {
            extNet.rpcURLs = net.rpcURLs;
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

export function isPathsEquals(a: string, b: string) {
  return a.split("/").join("") === b.split("/").join("");
}
