import { AccountType } from "./base";

export type AddAccountParams =
  | AddHDAccountParams
  | AddImportedAccountParams
  | AddHardwareAccountParams;

export interface AddAccountParamsBase {
  type: AccountType;
}

export interface AddHDAccountParams extends AddAccountParamsBase {
  type: AccountType.HD;
  derivationPath: string;
}

export interface AddImportedAccountParams extends AddAccountParamsBase {
  type: AccountType.Imported;
  privateKey: string;
}

export interface AddHardwareAccountParams extends AddAccountParamsBase {
  type: AccountType.Hardware;
  publicKey: string;
}
