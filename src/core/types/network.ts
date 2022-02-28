export interface Network {
  chainId: number;
  type: NetworkType;
  rpcUrls: string[];
  chainTag: string;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  ensRegistry?: string;
  explorerUrls?: string[];
  iconUrls?: string[];
  faucetUrls?: string[];
  infoUrl?: string;
}

export type NetworkType = "mainnet" | "testnet" | "unknown";
