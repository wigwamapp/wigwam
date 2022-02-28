import { Network } from "core/types";

import { db, RepoTable } from "./schema";

export const networks = db.table<Network, number>(RepoTable.Networks);

export async function clear() {
  try {
    const databases = await indexedDB.databases();
    for (const { name } of databases) {
      name && indexedDB.deleteDatabase(name);
    }
  } catch {}
}
