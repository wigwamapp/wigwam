import { Network, AccountToken, Contact, TokenActivity } from "core/types";

import { db, RepoTable } from "./schema";

export const networks = db.table<Network, number>(RepoTable.Networks);
export const contacts = db.table<Contact>(RepoTable.Contacts);
export const accountTokens = db.table<AccountToken>(RepoTable.AccountTokens);
export const tokenActivities = db.table<TokenActivity>(
  RepoTable.TokenActivities
);

export async function clear() {
  try {
    const databases = await indexedDB.databases();
    for (const { name } of databases) {
      name && indexedDB.deleteDatabase(name);
    }
  } catch {}
}
