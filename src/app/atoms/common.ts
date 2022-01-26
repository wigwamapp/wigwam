import { atom } from "jotai";
import { atomFamily, atomWithDefault, loadable, RESET } from "jotai/utils";
import { atomWithStorage, atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";
import { getAccounts, onAccountsUpdated } from "core/client";
import { INITIAL_NETWORK } from "fixtures/networks";
import { Account } from "core/types";

export const chainIdAtom = atomWithStorage<number>(
  "chain_id",
  INITIAL_NETWORK.chainId
);

export const accountAddressAtom = atomWithStorage<string | null>(
  "account_address",
  null
);

export const allAccountsAtom = atomWithDefault(getAccounts);
allAccountsAtom.onMount = (setAtom) => {
  const unsub = onAccountsUpdated(setAtom);

  return () => {
    unsub();
    setAtom((v) => v);
    setAtom(RESET);
  };
};

export const getNetworkAtom = atomFamily((chainId: number) =>
  atomWithRepoQuery(() => Repo.networks.get(chainId))
);

export const lazyNetworkAtom = atomFamily((chainId: number) =>
  loadable(getNetworkAtom(chainId))
);

export const allNetworksAtom = atomWithRepoQuery(() =>
  Repo.networks
    .filter((n) => ["mainnet", "testnet", "unknown"].includes(n.type))
    .toArray()
);

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
