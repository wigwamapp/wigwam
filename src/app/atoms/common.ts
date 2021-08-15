import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { assert } from "lib/system/assert";
import { atomWithStorage, atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";
import { INITIAL_NETWORK } from "fixtures/networks";

export const chainIdAtom = atomWithStorage<number>(
  "chain_id",
  INITIAL_NETWORK.chainId
);

export const accountAddressAtom = atomWithStorage<string>(
  "account_address",
  fetchDefaultAccountAddress
);

export const getAllAccountsAtom = atomWithRepoQuery(() =>
  Repo.accounts.toArray()
);

export const getNetworkAtom = atomFamily((chainId: number) =>
  atomWithRepoQuery(() => Repo.networks.get(chainId))
);

export const getAccountAtom = atomFamily((address: string) =>
  atomWithRepoQuery(() => Repo.accounts.get(address))
);

export const getCurrentNetworkAtom = atom((get) => {
  const chainId = get(chainIdAtom);
  const network = get(getNetworkAtom(chainId));
  assert(network);
  return network;
});

export const getCurrentAccountAtom = atom<Repo.IAccount>((get) => {
  const address = get(accountAddressAtom);
  const account = get(getAccountAtom(address));
  assert(account);
  return account;
});

async function fetchDefaultAccountAddress() {
  const allAccounts = await Repo.accounts.toArray();
  if (allAccounts.length === 0) {
    throw new Error("There are no accounts");
  }
  return allAccounts[0].address;
}
