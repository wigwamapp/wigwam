import { MetaMaskCompatibleMode } from "core/types/shared";

const ONE_HOUR = 60_000 * 60;
const ONE_DAY = ONE_HOUR * 24;
const TWO_DAYS = ONE_DAY * 2;
const ONE_WEEK = ONE_DAY * 7;

export const AUTO_LOCK_TIMEOUTS = new Map([
  [0, "None"],
  [60_000 * 5, "5 min"],
  [60_000 * 15, "15 min"],
  [ONE_HOUR, "1 hour"],
  [ONE_HOUR * 3, "3 hours"],
  [ONE_DAY, "1 day"],
  [TWO_DAYS, "2 days"],
  [ONE_WEEK, "1 week"],
]);

export const DEFAULT_AUTO_LOCK_TIMEOUT = TWO_DAYS;

export const DEFAULT_WEB_METAMASK_COMPATIBLE = MetaMaskCompatibleMode.Strict;

export const MAX_PASSWORD_ATTEMPTS_BEFORE_BLOCK = 7;
export const BLOCK_PROFILE_FOR = 60_000 * 1.5; // 1.5 min

export const PUSHTX_ADDITIONAL_BROADCAST = 3;
