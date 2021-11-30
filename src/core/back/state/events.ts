import { createEvent } from "effector";

import { ForApproval } from "core/types";

import { Vault } from "../vault";

export const inited = createEvent<boolean>();

export const unlocked = createEvent<Vault>();

export const locked = createEvent();

export const walletPortsCountUpdated = createEvent<number>();

export const approvalItemAdded = createEvent<ForApproval>();
