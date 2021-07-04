import { AccountType } from "core/types";

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

export type IAccount =
  | IHDAccount
  | IImportedAccount
  | IExternalAccount
  | IVoidAccount;

export interface IAccountBase {
  type: AccountType;
  address: string;
  name: string;
  params: Record<string, any>;
  usdValues: Record<number, string>;
}

export interface IHDAccount extends IAccountBase {
  type: AccountType.HD;
  params: {
    derivationPath: string;
  };
}

export interface IImportedAccount extends IAccountBase {
  type: AccountType.Imported;
}

export interface IExternalAccount extends IAccountBase {
  type: AccountType.External;
}

export interface IVoidAccount extends IAccountBase {
  type: AccountType.Void;
}
