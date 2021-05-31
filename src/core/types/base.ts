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

export interface SeedPharse {
  phrase: string;
  lang: string;
}
