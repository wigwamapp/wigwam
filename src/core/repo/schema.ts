import { underProfile } from "lib/ext/profile";

import { AsyncDexie } from "./asyncDexie";

export enum RepoTable {
  Networks = "networks",
  Contacts = "contacts",
  AccountTokens = "account_tokens",
  TokenActivities = "token_activities",
  Activities = "activities",
  Permissions = "permissions",
}

export const db = new AsyncDexie(underProfile("main"));

/**
 * 1
 */

db.version(1).stores({
  [RepoTable.Networks]: "&chainId,[type+position],chainTag",
  [RepoTable.Contacts]: "&address,name,addedAt",
  [RepoTable.AccountTokens]: [
    "",
    "[chainId+tokenSlug]",
    "[chainId+tokenType+accountAddress+balanceUSD]",
    "[chainId+tokenType+accountAddress+status+balanceUSD]",
  ].join(),
  [RepoTable.TokenActivities]: [
    "",
    "[chainId+accountAddress+tokenSlug+pending+timeAt]",
    "[txHash+pending]",
  ].join(),
  [RepoTable.Activities]: ["&id", "[pending+timeAt]", "[type+pending]"].join(),
  [RepoTable.Permissions]: "&origin,timeAt",
});

/**
 * 2
 */

db.version(2).stores({
  [RepoTable.AccountTokens]: [
    "",
    "[chainId+tokenSlug]",
    "[accountAddress+tokenSlug]",
    "[chainId+tokenType+accountAddress+balanceUSD]",
    "[chainId+tokenType+accountAddress+status+balanceUSD]",
  ].join(),
});
