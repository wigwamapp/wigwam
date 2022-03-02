import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import {
  atomWithStorage,
  atomWithRepoQuery,
  atomWithAutoReset,
} from "lib/atom-utils";

import * as Repo from "core/repo";
import { getAccounts, onAccountsUpdated } from "core/client";
import { INITIAL_NETWORK } from "fixtures/networks";
import { Account } from "core/types";

import { testNetworksAtom } from "./settings";

export const chainIdAtom = atomWithStorage<number>(
  "chain_id",
  INITIAL_NETWORK.chainId
);

export const accountAddressAtom = atomWithStorage<string | null>(
  "account_address",
  null
);

export const allAccountsAtom = atomWithAutoReset(getAccounts, {
  onMount: onAccountsUpdated,
  resetDelay: 5_000,
});

export const getNetworkAtom = atomFamily((chainId: number) =>
  atomWithRepoQuery((query) => {
    return query(() => Repo.networks.get(chainId));
  })
);

export const lazyNetworkAtom = atomFamily((chainId: number) =>
  loadable(getNetworkAtom(chainId))
);

export const allNetworksAtom = atomWithRepoQuery((query, get) => {
  const testnetEnabled = get(testNetworksAtom);

  const netTypes = [
    "mainnet",
    "unknown",
    ...(testnetEnabled ? ["testnet"] : []),
  ];

  return query(() => Repo.networks.where("type").anyOf(netTypes).toArray());
});

export const currentAccountAtom = atom<Account>((get) => {
  const allAccounts = get(allAccountsAtom);
  if (allAccounts.length === 0) {
    throw new Error("There are no accounts");
  }

  const address = get(accountAddressAtom);
  const index = address
    ? allAccounts.findIndex((acc) => acc.address === address)
    : 0;

  return allAccounts[index === -1 ? 0 : index];
});
