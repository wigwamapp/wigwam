import { AccountSourceType, AccountType } from "./base";

export type AccountParams =
  | HDAccountParams
  | ByPrivateKeyAccountParams
  | LedgerAccountParams
  | TorusAccountParams
  | WatchOnlyAccountParams;

export interface AccountParamsBase {
  type: AccountType;
  sourceType: AccountSourceType;
}

export interface HDAccountParams extends AccountParamsBase {
  type: AccountType.HD;
  sourceType: AccountSourceType.SeedPhrase;
  derivationPath: string;
}

export interface ByPrivateKeyAccountParams extends AccountParamsBase {
  type: AccountType.Imported;
  sourceType: AccountSourceType.PrivateKey;
}

export interface LedgerAccountParams extends AccountParamsBase {
  type: AccountType.External;
  sourceType: AccountSourceType.Ledger;
  derivationPath: string;
}

export interface TorusAccountParams extends AccountParamsBase {
  type: AccountType.Imported;
  sourceType: AccountSourceType.Torus;
  social: string;
}

export interface WatchOnlyAccountParams extends AccountParamsBase {
  type: AccountType.Void;
  sourceType: AccountSourceType.Address;
}
