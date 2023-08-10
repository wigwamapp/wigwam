import { createEvent, merge } from "effector";

import { Approval, Account } from "core/types";

import { Vault } from "../vault";

export const inited = createEvent<boolean>();

export const unlocked = createEvent<{
  vault: Vault;
  accounts: Account[];
  hasSeedPhrase: boolean;
  approvals?: Approval[];
}>();

export const locked = createEvent();

export const seedPhraseAdded = createEvent();

export const accountsUpdated = createEvent<Account[]>();

export const walletPortsCountUpdated = createEvent<number>();

export const approvalAdded = createEvent<Approval>();

export const approvalResolved = createEvent<string>();

export const approvalsRejected = createEvent<string[] | null>();

export const approvalsChanged = merge([
  approvalAdded,
  approvalResolved,
  approvalsRejected,
]);

export const syncStarted = createEvent<number | string>();

export const synced = createEvent<number | string>();
