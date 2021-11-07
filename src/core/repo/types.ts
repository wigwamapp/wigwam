import { AccountParams } from "core/types";

export enum RepoTable {
  Networks = "networks",
  Accounts = "accounts",
}

export interface INetwork {
  chainId: number;
  rpcUrls: string[];
  chain: string;
  name: string;
  mainnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  explorerUrls?: string[];
  ensRegistry?: string;
  iconUrls?: string[];
  faucetUrls?: string[];
  infoUrl?: string;
}

export type IAccount = AccountParams & {
  address: string;
  name: string;
  usdValues: Record<number, string>;
};
