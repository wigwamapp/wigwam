export enum Page {
  Default = "default",
  Setup = "setup",
  Profiles = "profiles",
  Unlock = "unlock",
  Receive = "receive",
  Transfer = "transfer",
  Swap = "swap",
  Apps = "apps",
  Contacts = "contacts",
  Wallets = "wallets",
  Settings = "settings",
}

export enum AddAccountStep {
  ChooseWay = "choose-way",
  CreateSeedPhrase = "create-seed-phrase",
  ImportSeedPhrase = "import-seed-phrase",
  ImportPrivateKey = "import-private-key",
  AddWatchOnlyAccount = "add-watch-only",
  VerifySeedPhrase = "verify-seed-phrase",
  SelectAccountsToAddMethod = "select-accounts-to-add-method",
  VerifyToAdd = "verify-to-add",
  SetupPassword = "setup-password",
}

export enum SettingTab {
  General = "general",
  Profile = "profile",
  Security = "security-&-privacy",
  Web3 = "web-3",
  Networks = "networks",
  About = "about",
  Advanced = "advanced",
}

export enum TransferTab {
  Asset = "asset",
  Nft = "nft",
  Bridge = "bridge",
}

export enum ReceiveTab {
  ShareAddress = "share-address",
  BuyWithCrypto = "buy-with-crypto",
  BuyWithFiat = "buy-with-fiat",
  Faucet = "faucet",
}
