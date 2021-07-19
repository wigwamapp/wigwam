import { AccountType } from "./base";

export type AddAccountsParams =
  | AddHDAccountsParams
  | AddImportedAccountsParams
  | AddExternalAccountsParams
  | AddVoidAccountsParams;

export interface AddAccountsParamsBase {
  type: AccountType;
  names?: string[];
}

export interface AddHDAccountsParams extends AddAccountsParamsBase {
  type: AccountType.HD;
  derivationPaths: string[];
}

export interface AddImportedAccountsParams extends AddAccountsParamsBase {
  type: AccountType.Imported;
  privateKeys: string[];
}

export interface AddExternalAccountsParams extends AddAccountsParamsBase {
  type: AccountType.External;
  publicKeys: string[];
}

export interface AddVoidAccountsParams extends AddAccountsParamsBase {
  type: AccountType.Void;
  addresses: string[];
}
