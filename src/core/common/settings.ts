export enum Setting {
  AutoLockTimeout = "auto_lock_timeout",
  TestNetworks = "test_networks",
  Analytics = "analytics",
}

export type AnalyticsState = {
  enabled: boolean;
  userId?: string;
};
