import { createEvent } from "effector";

import { ForApproval, Account } from "core/types";

import { Vault } from "../vault";

export const inited = createEvent<boolean>();

export const unlocked = createEvent<{ vault: Vault; accounts: Account[] }>();

export const locked = createEvent();

export const accountsUpdated = createEvent<Account[]>();

export const walletPortsCountUpdated = createEvent<number>();

export const approvalItemAdded = createEvent<ForApproval>();
