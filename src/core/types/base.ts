export enum WalletStatus {
  Idle,
  Welcome,
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

export type AddAccountParams =
  | AddHDAccountParams
  | AddImportedAccountParams
  | AddHardwareAccountParams;

export interface AddAccountParamsBase {
  type: AccountType;
}

export interface AddHDAccountParams extends AddAccountParamsBase {
  type: AccountType.HD;
  derivationPath: string;
}

export interface AddImportedAccountParams extends AddAccountParamsBase {
  type: AccountType.Imported;
  privateKey: string;
}

export interface AddHardwareAccountParams extends AddAccountParamsBase {
  type: AccountType.Hardware;
  publicKey: string;
}
