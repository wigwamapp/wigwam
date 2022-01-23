import { HDAccount, AddHDAccountParams } from "./hd";
import { LedgerAccount, AddLedgerAccountParams } from "./ledger";
import { PrivateKeyAccount, AddPrivateKeyAccountParams } from "./privateKey";
import { SocialAccount, AddSocialAccountParams } from "./social";
import { WatchOnlyAccount, AddWatchOnlyAccountParams } from "./watchOnly";

export * from "./base";
export * from "./hd";
export * from "./ledger";
export * from "./privateKey";
export * from "./social";
export * from "./watchOnly";

export type Account =
  | HDAccount
  | PrivateKeyAccount
  | LedgerAccount
  | SocialAccount
  | WatchOnlyAccount;

export type AddAccountParams =
  | AddHDAccountParams
  | AddLedgerAccountParams
  | AddPrivateKeyAccountParams
  | AddSocialAccountParams
  | AddWatchOnlyAccountParams;
