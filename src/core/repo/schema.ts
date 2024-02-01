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
 * [1]
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
 * [2]
 * - Allow to query native tokens for one account for all chains
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

/**
 * [3]
 * - Allow to query for one account
 * - Allow to query for one account and one chain
 */

db.version(3).stores({
  [RepoTable.Activities]: [
    "&id",
    "[type+pending]",
    "[type+accountAddress+pending]",
    "[pending+timeAt]",
    "[accountAddress+pending+timeAt]",
    "[accountAddress+chainId+pending+timeAt]",
  ].join(),
});
