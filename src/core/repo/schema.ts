import Dexie from "dexie";

import { underProfile } from "lib/ext/profile";

import { INetwork, IAccount } from "./types";

export enum Table {
  Networks = "networks",
  Accounts = "accounts",
}

export const db = new Dexie(underProfile("main"));

export const networks = db.table<INetwork, number>(Table.Networks);
export const accounts = db.table<IAccount, string>(Table.Accounts);

/**
 * 1
 */

db.version(1).stores({
  [Table.Networks]: "&chainId,*rpcURLs,name,mainAssetSymbol,mainAssetName",
  [Table.Accounts]: "&address,type",
});
