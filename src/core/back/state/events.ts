import { createEvent } from "effector";
import { Vault } from "../vault";

export const inited = createEvent<boolean>();

export const unlocked = createEvent<Vault>();

export const locked = createEvent();
