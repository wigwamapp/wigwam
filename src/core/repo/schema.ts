import { underProfile } from "lib/ext/profile";

import { RepoTable } from "./types";
import { AsyncDexie } from "./asyncDexie";

export const db = new AsyncDexie(underProfile("main"));

/**
 * 1
 */

db.version(1).stores({
  [RepoTable.Networks]: "&chainId,type,chainTag",
  [RepoTable.Accounts]: "&address,type,source",
});
