export enum Setting {
  AutoLockTimeout = "auto_lock_timeout",
  TestNetworks = "test_networks",
  Analytics = "analytics",
  Web3MetaMaskCompatible = "web3_mm_comp",
}

export type AnalyticsState = {
  enabled: boolean;
  userId?: string;
};
