import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { assert } from "lib/system/assert";
import { atomWithGlobal, atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";
import { getClientProvider } from "core/client";
import { INITIAL_NETWORK } from "fixtures/networks";

export const chainIdAtom = atomWithGlobal<number>(
  "chain_id",
  INITIAL_NETWORK.chainId
);

export const accountAddressAtom = atomWithGlobal<string | null>(
  "account_address",
  null
);

export const getAllAccountsAtom = atomWithRepoQuery(() =>
  Repo.accounts.toArray()
);

export const getNetworkAtom = atomFamily((chainId: number) =>
  atomWithRepoQuery(() => Repo.networks.get(chainId))
);

export const getAllMainNetworksAtom = atomWithRepoQuery(() =>
  Repo.networks
    .filter((n) => ["mainnet", "manually-added"].includes(n.type))
    .toArray()
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
  const allAccounts = get(getAllAccountsAtom);
  if (allAccounts.length === 0) {
    throw new Error("There are no accounts");
  }

  const address = get(accountAddressAtom);
  const index = address
    ? allAccounts.findIndex((acc) => acc.address === address)
    : 0;

  return allAccounts[index === -1 ? 0 : index];
});

export const getProviderAtom = atom((get) => {
  const chainId = get(chainIdAtom);
  return getClientProvider(chainId);
});
