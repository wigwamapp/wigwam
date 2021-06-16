import Dexie from "dexie";

import { underProfile } from "lib/ext/profile";

export enum Table {
  Networks = "networks",
  Accounts = "accounts",
}

export const db = new Dexie(underProfile("main"));

/**
 * 1
 */

db.version(1).stores({
  [Table.Networks]: "&chainId,*rpcURLs,name,mainAssetSymbol,mainAssetName",
  [Table.Accounts]: "&address,type",
});
