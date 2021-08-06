import { atomFamily } from "jotai/utils";
import { assert } from "lib/system/assert";

import * as Repo from "core/repo";
import { INITIAL_NETWORK } from "fixtures/networks";

import {
  atomWithGetStorage,
  atomWithSetStorage,
  atomWithAutoReset,
} from "./utils";

export const getChainIdAtom = atomWithGetStorage<number>(
  "chain_id",
  INITIAL_NETWORK.chainId
);

export const setChainIdAtom = atomWithSetStorage<number>("chain_id");

export const getAccountAddressAtom = atomWithGetStorage<string>(
  "account_address",
  fetchDefaultAccountAddress
);

export const setAcountAddressAtom =
  atomWithSetStorage<string>("account_address");

export const allAccountsAtom = atomWithAutoReset(() => Repo.accounts.toArray());

export const getNetworkAtom = atomFamily((chainId: number) =>
  atomWithAutoReset(() => Repo.networks.get(chainId))
);

export const getAccountAtom = atomFamily((address: string) =>
  atomWithAutoReset(() => Repo.accounts.get(address))
);

export const getCurrentNetworkAtom = atomWithAutoReset((get) => {
  const chainId = get(getChainIdAtom);
  const network = get(getNetworkAtom(chainId));
  assert(network);
  return network;
});

export const getCurrentAccountAtom = atomWithAutoReset<Repo.IAccount>((get) => {
  const address = get(getAccountAddressAtom);
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
