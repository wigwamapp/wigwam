export enum WalletStatus {
  Idle,
  Welcome,
  Locked,
  Unlocked,
}

export interface SeedPharse {
  [key: string]: string;

  phrase: string;
  lang: string;
}
