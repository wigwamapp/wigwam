import { createEvent } from "effector";

import { Approval, Account } from "core/types";

import { Vault } from "../vault";

export const inited = createEvent<boolean>();

export const unlocked = createEvent<{
  vault: Vault;
  accounts: Account[];
  hasSeedPhrase: boolean;
}>();

export const locked = createEvent();

export const seedPhraseAdded = createEvent();

export const accountsUpdated = createEvent<Account[]>();

export const walletPortsCountUpdated = createEvent<number>();

export const approvalAdded = createEvent<Approval>();

export const approvalsResolved = createEvent<string[]>();

export const syncStarted = createEvent<number>();

export const synced = createEvent<number>();
