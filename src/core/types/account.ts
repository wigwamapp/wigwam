import { AccountSource, AccountType } from "./base";

export type AccountParams =
  | HDAccountParams
  | ByPrivateKeyAccountParams
  | LedgerAccountParams
  | OpenLoginAccountParams
  | WatchOnlyAccountParams;

export interface AccountParamsBase {
  type: AccountType;
  source: AccountSource;
}

export interface HDAccountParams extends AccountParamsBase {
  type: AccountType.HD;
  source: AccountSource.SeedPhrase;
  derivationPath: string;
}

export interface ByPrivateKeyAccountParams extends AccountParamsBase {
  type: AccountType.Imported;
  source: AccountSource.PrivateKey;
}

export interface LedgerAccountParams extends AccountParamsBase {
  type: AccountType.External;
  source: AccountSource.Ledger;
  derivationPath: string;
}

export interface OpenLoginAccountParams extends AccountParamsBase {
  type: AccountType.Imported;
  source: AccountSource.OpenLogin;
  social: string;
}

export interface WatchOnlyAccountParams extends AccountParamsBase {
  type: AccountType.Void;
  source: AccountSource.Address;
}
