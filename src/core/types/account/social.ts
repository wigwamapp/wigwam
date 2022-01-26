import { AccountSource, AccountBase, AddAccountParamsBase } from "./base";

export interface SocialAccount extends AccountBase {
  source: AccountSource.OpenLogin;
  social: string;
}

export interface AddSocialAccountParams extends AddAccountParamsBase {
  source: AccountSource.OpenLogin;
  social: string;
  privateKey: string;
}
