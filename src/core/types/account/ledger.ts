import { AccountSource, AccountBase, AddAccountParamsBase } from "./base";

export interface LedgerAccount extends AccountBase {
  source: AccountSource.Ledger;
  derivationPath: string;
}

export interface AddLedgerAccountParams extends AddAccountParamsBase {
  source: AccountSource.Ledger;
  derivationPath: string;
  publicKey: string;
}
