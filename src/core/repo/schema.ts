import { underProfile } from "lib/ext/profile";

import { AsyncDexie } from "./asyncDexie";

export enum RepoTable {
  Networks = "networks",
}

export const db = new AsyncDexie(underProfile("main"));

/**
 * 1
 */

db.version(1).stores({
  [RepoTable.Networks]: "&chainId,type,chainTag",
});
