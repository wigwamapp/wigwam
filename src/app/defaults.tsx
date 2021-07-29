export const FONTS: [string, number[]][] = [["Inter", [300, 400, 600, 700]]];

export enum WalletStep {
  ChooseLanguage = "choose-language",
  ChooseAddAccountWay = "choose-add-account-way",
  CreateSeedPhrase = "create-seed-phrase",
  ImportSeedPhrase = "import-seed-phrase",
  VerifySeedPhrase = "verify-seed-phrase",
  AddHDAccounts = "add-hd-accounts",
  AddByPrivateKeyAccount = "add-by-private-key-account",
  AddLedgerAccounts = "add-ledger-accounts",
  AddTorusAccount = "add-torus-account",
  SetupPassword = "setup-password",
}
