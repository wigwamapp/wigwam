import { underProfile } from "lib/ext/profile";

import { AsyncDexie } from "./asyncDexie";

export enum RepoTable {
  Networks = "networks",
  AccountTokens = "account_tokens",
}

export const db = new AsyncDexie(underProfile("main"));

/**
 * 1
 */

db.version(1).stores({
  [RepoTable.Networks]: "&chainId,type,chainTag",
  [RepoTable.AccountTokens]: [
    "",
    "[chainId+tokenSlug]",
    "[chainId+tokenType+accountAddress]",
    "[chainId+tokenType+accountAddress+disabled+balanceUSD]",
  ].join(),
});
