import Dexie from "dexie";

import { AccountType } from "core/types";

export enum Table {
  Networks = "networks",
  Accounts = "accounts",
}

export const db = new Dexie("VigvamMain");
db.version(1).stores({
  [Table.Networks]: "&chainId,*rpcURLs,primaryRpcURL",
  [Table.Accounts]: "&address,type",
});

export const networks = db.table<INetwork, number>(Table.Networks);
export const accounts = db.table<IAccount, string>(Table.Accounts);

export interface INetwork {
  chainId: number;
  rpcURLs: string[];
  primaryRpcURL: string;
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
