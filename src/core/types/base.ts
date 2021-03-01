export enum WalletStatus {
  NotInited,
  Idle,
  Locked,
  Ready,
}

export enum AccountType {
  HD = "HD",
  Imported = "IMPORTED",
  Hardware = "HARDWARE",
  Void = "VOID",
}

export interface SeedPharse {
  phrase: string;
  lang: string;
}
