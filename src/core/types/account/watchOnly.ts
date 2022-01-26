import { AccountSource, AccountBase, AddAccountParamsBase } from "./base";

export interface WatchOnlyAccount extends AccountBase {
  source: AccountSource.Address;
}

export interface AddWatchOnlyAccountParams extends AddAccountParamsBase {
  source: AccountSource.Address;
  address: string;
}
