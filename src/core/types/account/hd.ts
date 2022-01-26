import { AccountSource, AccountBase, AddAccountParamsBase } from "./base";

export interface HDAccount extends AccountBase {
  source: AccountSource.SeedPhrase;
  derivationPath: string;
}

export interface AddHDAccountParams extends AddAccountParamsBase {
  source: AccountSource.SeedPhrase;
  derivationPath: string;
}
