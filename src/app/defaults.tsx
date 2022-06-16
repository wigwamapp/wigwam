import Fuse from "fuse.js";
import { Font } from "lib/web-fonts";

import { Account, Network } from "core/types";

export const NETWORK_SEARCH_OPTIONS: Fuse.IFuseOptions<Network> = {
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

export const ACCOUNTS_SEARCH_OPTIONS: Fuse.IFuseOptions<Account> = {
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

export const FONTS: Font[] = [["Inter", 300, 400, 600, 700, 900]];

export const LOAD_MORE_ON_ASSET_FROM_END = 3;
export const LOAD_MORE_ON_ACTIVITY_FROM_END = 3;
export const LOAD_MORE_ON_CONTACTS_FROM_END = 15;
export const LOAD_MORE_ON_CONTACTS_DROPDOWN_FROM_END = 5;
