import { AccountSource, AccountBase, AddAccountParamsBase } from "./base";

export interface PrivateKeyAccount extends AccountBase {
  source: AccountSource.PrivateKey;
}

export interface AddPrivateKeyAccountParams extends AddAccountParamsBase {
  source: AccountSource.PrivateKey;
  privateKey: string;
}
