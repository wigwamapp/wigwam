import { AccountSource, AccountBase, AddAccountParamsBase } from "./base";

export interface SocialAccount extends AccountBase, SocialAccountFields {
  source: AccountSource.OpenLogin;
}

export interface AddSocialAccountParams
  extends AddAccountParamsBase,
    SocialAccountFields {
  source: AccountSource.OpenLogin;
  privateKey: string;
}

export interface SocialAccountFields {
  social: SocialProvider;
  socialName: string;
  socialEmail: string;
}

export type SocialProvider = "google" | "facebook" | "twitter" | "reddit";
