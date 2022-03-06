import Fuse from "fuse.js";
import { Font } from "lib/web-fonts";

import { Account, Network } from "core/types";
import { AssetTempType } from "app/temp-data/assets";

export enum Page {
  Default = "default",
  Setup = "setup",
  Profiles = "profiles",
  Unlock = "unlock",
  Overview = "overview",
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
      name: "chainId",
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
    "rpcUrls.value",
    "type",
  ],
};

export const ACCOUNTS_SEARCH_OPTIONS: Fuse.IFuseOptions<Account> = {
  includeScore: true,
  shouldSort: false,
  keys: [
    {
      name: "name",
      weight: 3,
    },
    "address",
    // "source", TODO: More flexible source as GMAIL, TWITTER, etc.
  ],
};

export const ASSETS_SEARCH_OPTIONS: Fuse.IFuseOptions<AssetTempType> = {
  includeScore: true,
  shouldSort: false,
  keys: [
    {
      name: "name",
      weight: 3,
    },
    {
      name: "symbol",
      weight: 3,
    },
    {
      name: "address",
      weight: 2,
    },
    "balance",
    "dollars",
  ],
};

export const FONTS: Font[] = [["Inter", 300, 400, 600, 700, 900]];
