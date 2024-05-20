export interface Network {
  chainId: number;
  type: NetworkType;
  chainTag: string;
  rpcUrls: string[];
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  ensRegistry?: string;
  explorerUrls?: string[];
  explorerApiUrl?: string;
  iconUrls?: string[];
  faucetUrls?: string[];
  parent?: {
    type: "L2" | "shard";
    chain: string;
    bridges?: { url: string }[];
  };
  infoUrl?: string;
  position?: number;
  balanceUSD?: string;
  manuallyChanged?: boolean;
}

export type NetworkType = "mainnet" | "testnet" | "unknown";
