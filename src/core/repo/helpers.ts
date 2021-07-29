import { db } from "./schema";
import { RepoTable, INetwork, IAccount } from "./types";

export const networks = db.table<INetwork, number>(RepoTable.Networks);
export const accounts = db.table<IAccount, string>(RepoTable.Accounts);

export function clear() {
  return Promise.all([networks.clear(), accounts.clear()]);
}
