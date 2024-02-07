import { storage } from "lib/ext/storage";

import { DEFAULT_AUTO_LOCK_TIMEOUT } from "fixtures/settings";

export enum Setting {
  AutoLockTimeout = "auto_lock_timeout",
  TestNetworks = "test_networks",
  Analytics = "analytics",
  Web3MetaMaskCompatible = "connect_as_metamask",
  RequiredAuthSig = "required_authsig",
  ProfileBlockedUntil = "profile_blocked_until",
  PasswordUsageAttempts = "password_usage_attempts",
}

export async function retrieveAutoLockTimeout() {
  const stored = await storage.fetchForce<number>(Setting.AutoLockTimeout);
  return stored ?? DEFAULT_AUTO_LOCK_TIMEOUT;
}

export type AnalyticsState = {
  enabled: boolean;
  userId?: string;
};
