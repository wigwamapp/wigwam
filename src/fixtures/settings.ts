import { MetaMaskCompatibleMode } from "core/types/shared";

const ONE_HOUR = 60 * 60_000;
const TWO_DAYS = 2 * 24 * ONE_HOUR;

export const AUTO_LOCK_TIMEOUTS: number[] = [
  0, // off
  5 * 60_000, // 5 min
  15 * 60_000, // 15 min
  ONE_HOUR, // 1 hour
  3 * ONE_HOUR, // 3 hours
  24 * ONE_HOUR, // 1 day
  TWO_DAYS, // 2 days
];

export const DEFAULT_AUTO_LOCK_TIMEOUT = TWO_DAYS;

export const DEFAULT_WEB_METAMASK_COMPATIBLE = MetaMaskCompatibleMode.Off;
