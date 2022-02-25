import Fuse from "fuse.js";
import { Font } from "lib/web-fonts";

import type { INetwork } from "core/repo";
import { Account } from "core/types";

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

export const ACCOUNTS_SEARCH_OPTIONS: Fuse.IFuseOptions<Account> = {
  includeScore: true,
  keys: [
    {
      name: "address",
      weight: 1,
    },
    {
      name: "name",
      weight: 1,
    },
    {
      name: "source",
      weight: 2,
    },
  ],
};

export const FONTS: Font[] = [["Inter", 300, 400, 600, 700, 900]];
