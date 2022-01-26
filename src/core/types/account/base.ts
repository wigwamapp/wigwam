export enum AccountSource {
  SeedPhrase = "SEED_PHRASE",
  PrivateKey = "PRIVATE_KEY",
  OpenLogin = "OPEN_LOGIN",
  Ledger = "LEDGER",
  Address = "ADDRESS",
}

export interface AccountBase extends AddAccountParamsBase {
  uuid: string;
  address: string;
}

export interface AddAccountParamsBase {
  [key: string]: string;

  source: AccountSource;
  name: string;
}
