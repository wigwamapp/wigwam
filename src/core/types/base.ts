export enum WalletStatus {
  Idle,
  Welcome,
  Locked,
  Unlocked,
}

export interface SeedPharse {
  phrase: string;
  lang: string;
}
