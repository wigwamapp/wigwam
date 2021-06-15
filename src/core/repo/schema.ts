import Dexie from "dexie";

export enum Table {
  Networks = "networks",
  Accounts = "accounts",
}

export const db = new Dexie("VigvamMain");

/**
 * 1
 */

db.version(1).stores({
  [Table.Networks]: "&chainId,*rpcURLs,name,mainAssetSymbol,mainAssetName",
  [Table.Accounts]: "&address,type",
});
