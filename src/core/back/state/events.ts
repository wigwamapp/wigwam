import { createEvent } from "effector";
import { Runtime } from "webextension-polyfill";

import { ForApproval } from "core/types";

import { Vault } from "../vault";

export const inited = createEvent<boolean>();

export const unlocked = createEvent<Vault>();

export const locked = createEvent();

export const pinged = createEvent();

export const portDisconnected = createEvent<Runtime.Port>();

export const approvalItemAdded = createEvent<ForApproval>();
