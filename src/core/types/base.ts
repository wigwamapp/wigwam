export enum WalletStatus {
  Idle,
  Welcome,
  Locked,
  Ready,
}

export enum AccountType {
  HD = "HD",
  Imported = "IMPORTED",
  External = "EXTERNAL",
  Void = "VOID",
}

export enum AccountSourceType {
  SeedPhrase = "SEED_PHRASE",
  PrivateKey = "PRIVATE_KEY",
  Torus = "TORUS",
  Ledger = "LEDGER",
  Address = "ADDRESS",
}

export interface SeedPharse {
  phrase: string;
  lang: string;
}
