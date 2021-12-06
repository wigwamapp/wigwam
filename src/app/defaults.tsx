import { Font } from "lib/ext/fonts";

export const FONTS: Font[] = [["Inter", 300, 400, 600, 700, 900]];

export enum Page {
  Default = "default",
  Setup = "setup",
  Profiles = "profiles",
  Unlock = "unlock",
  Overview = "overview",
  Receive = "receive",
  Send = "send",
  Swap = "swap",
  Apps = "apps",
  Contacts = "contacts",
  Wallets = "wallets",
  Settings = "settings",
}

export enum WalletStep {
  ChooseLanguage = "choose-language",
  ChooseAddAccountWay = "choose-add-account-way",
  CreateSeedPhrase = "create-seed-phrase",
  ImportSeedPhrase = "import-seed-phrase",
  VerifySeedPhrase = "verify-seed-phrase",
  AddHDAccounts = "add-hd-accounts",
  AddByPrivateKeyAccount = "add-by-private-key-account",
  AddLedgerAccounts = "add-ledger-accounts",
  AddOpenLoginAccount = "add-open-login-account",
  SetupPassword = "setup-password",
}
