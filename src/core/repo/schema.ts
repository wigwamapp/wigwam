import Dexie from "dexie";

import { underProfile } from "lib/ext/profile";

import { RepoTable } from "./types";

export const db = new Dexie(underProfile("main"));

/**
 * 1
 */

db.version(1).stores({
  [RepoTable.Networks]: "&chainId,*rpcUrls,name,mainnet",
  [RepoTable.Accounts]: "&address,name,type,source",
});
