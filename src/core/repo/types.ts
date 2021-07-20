import { AccountParams } from "core/types";

export enum RepoTable {
  Networks = "networks",
  Accounts = "accounts",
}

export interface INetwork {
  chainId: number;
  rpcURLs: string[];
  main: boolean;
  name: string;
  mainAssetSymbol?: string;
  mainAssetName?: string;
  blockExplorerURL?: string;
}

export type IAccount = AccountParams & {
  address: string;
  name: string;
  usdValues: Record<number, string>;
};
