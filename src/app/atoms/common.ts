import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import { atomWithGlobal, atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";
import { INITIAL_NETWORK } from "fixtures/networks";

export const chainIdAtom = atomWithGlobal<number>(
  "chain_id",
  INITIAL_NETWORK.chainId
);

export const accountAddressAtom = atomWithGlobal<string | null>(
  "account_address",
  null
);

export const allAccountsAtom = atomWithRepoQuery(() => Repo.accounts.toArray());

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

export const getAccountAtom = atomFamily((address: string) =>
  atomWithRepoQuery(() => Repo.accounts.get(address))
);

export const currentAccountAtom = atom<Repo.IAccount>((get) => {
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
