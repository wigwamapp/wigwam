import { AccountType } from "./base";

export type AddAccountParams =
  | AddHDAccountParams
  | AddImportedAccountParams
  | AddExternalAccountParams
  | AddVoidAccountParams;

export interface AddAccountParamsBase {
  type: AccountType;
  name?: string;
}

export interface AddHDAccountParams extends AddAccountParamsBase {
  type: AccountType.HD;
  derivationPath: string;
}

export interface AddImportedAccountParams extends AddAccountParamsBase {
  type: AccountType.Imported;
  privateKey: string;
}

export interface AddExternalAccountParams extends AddAccountParamsBase {
  type: AccountType.External;
  publicKey: string;
}

export interface AddVoidAccountParams extends AddAccountParamsBase {
  type: AccountType.Void;
  address: string;
}
