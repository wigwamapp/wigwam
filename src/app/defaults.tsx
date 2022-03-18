import Fuse from "fuse.js";
import { Font } from "lib/web-fonts";

import { Account, Network } from "core/types";

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

export enum WelcomeStep {
  Hello = "hello",
  ChooseLanguage = "choose-language",
  LetsBegin = "lets-begin",
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

export enum AddAccountStep {
  ChooseWay = "choose-way",
  AddSeedPhrase = "add-seed-phrase",
  VerifySeedPhrase = "verify-seed-phrase",
  SelectDerivation = "select-derivation",
  AddPrivateKey = "add-private-key",
  SelectAccountsToAddMethod = "select-accounts-to-add-method",
  VerifyToAdd = "verify-to-add",
  SetupPassword = "setup-password",
}

export const NETWORK_SEARCH_OPTIONS: Fuse.IFuseOptions<Network> = {
  includeScore: true,
  threshold: 0.3,
  keys: [
    {
      name: "name",
      weight: 4,
    },
    {
      name: "chainTag",
      weight: 3,
    },
    {
      name: "nativeCurrency.name",
      weight: 2,
    },
    {
      name: "nativeCurrency.symbol",
      weight: 2,
    },
  ],
};

export const ACCOUNTS_SEARCH_OPTIONS: Fuse.IFuseOptions<Account> = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.45,
  keys: [
    {
      name: "name",
      weight: 3,
    },
    "address",
    // "source", TODO: More flexible source as GMAIL, TWITTER, etc.
  ],
};

export const FONTS: Font[] = [["Inter", 300, 400, 600, 700, 900]];

export const LOAD_MORE_ON_ASSET_FROM_END = 3;
