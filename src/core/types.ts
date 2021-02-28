export enum TakyMessageType {
  PageMessage = "PAGE_MESSAGE",
}

export interface TakyMessageBase {
  type: TakyMessageType;
}

export interface TakyPermissionMessage extends TakyMessageBase {
  type: TakyMessageType.PageMessage;
}

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
