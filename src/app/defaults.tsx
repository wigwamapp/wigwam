import Fuse from "fuse.js";
import { Font } from "lib/web-fonts";

import type { INetwork } from "core/repo";

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

export const NETWORK_SEARCH_OPTIONS: Fuse.IFuseOptions<INetwork> = {
  includeScore: true,
  keys: [
    {
      name: "name",
      weight: 1,
    },
    {
      name: "chainTag",
      weight: 2,
    },
    {
      name: "chainId",
      weight: 2,
    },
    {
      name: "nativeCurrency.name",
      weight: 3,
    },
    {
      name: "nativeCurrency.symbol",
      weight: 3,
    },
    {
      name: "rpcUrls.value",
      weight: 4,
    },
    {
      name: "type",
      weight: 4,
    },
  ],
};

export const FONTS: Font[] = [["Inter", 300, 400, 600, 700, 900]];
