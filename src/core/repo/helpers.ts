import { db } from "./schema";
import { RepoTable, INetwork } from "./types";

export const networks = db.table<INetwork, number>(RepoTable.Networks);

export async function clear() {
  try {
    const databases = await indexedDB.databases();
    for (const { name } of databases) {
      name && indexedDB.deleteDatabase(name);
    }
  } catch {}
}
