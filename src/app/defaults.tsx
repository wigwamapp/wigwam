import type { IFuseOptions } from "fuse.js";
import { Font } from "lib/web-fonts";

import { Account, Network } from "core/types";
import { EvmNetwork } from "core/common/chainList";

export const NETWORK_SEARCH_OPTIONS: IFuseOptions<Network | EvmNetwork> = {
  includeScore: true,
  threshold: 0.3,
  fieldNormWeight: 1,
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

export const ACCOUNTS_SEARCH_OPTIONS: IFuseOptions<Account> = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.45,
  fieldNormWeight: 1,
  keys: [
    {
      name: "name",
      weight: 3,
    },
    "address",
    // "source", TODO: More flexible source as GMAIL, TWITTER, etc.
  ],
};

export const FONTS: Font[] = [["InterVariable", 300, 400, 600, 700, 900]];

export const LOAD_MORE_ON_TOKEN_FROM_END = 3;
export const LOAD_MORE_ON_NFT_FROM_END = 6;
export const LOAD_MORE_ON_ACTIVITY_FROM_END = 3;
export const LOAD_MORE_ON_CONTACTS_FROM_END = 15;
export const LOAD_MORE_ON_CONTACTS_DROPDOWN_FROM_END = 5;

export const IS_FIREFOX = process.env.TARGET_BROWSER === "firefox";

export const TRANSAK_SUPPORT_URL = "https://support.transak.com/";
