export enum WalletStatus {
  Idle,
  Welcome,
  Locked,
  Unlocked,
}

export enum AccountType {
  HD = "HD",
  Imported = "IMPORTED",
  External = "EXTERNAL",
  Void = "VOID",
}

export enum AccountSource {
  SeedPhrase = "SEED_PHRASE",
  PrivateKey = "PRIVATE_KEY",
  OpenLogin = "OPEN_LOGIN",
  Ledger = "LEDGER",
  Address = "ADDRESS",
}

export interface SeedPharse {
  phrase: string;
  lang: string;
}
