import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import {
  atomWithStorage,
  atomWithRepoQuery,
  atomWithAutoReset,
} from "lib/atom-utils";
import { INITIAL_NETWORK } from "fixtures/networks";

import * as Repo from "core/repo";
import { getAccounts, onAccountsUpdated } from "core/client";
import { Account } from "core/types";
import { getRpcUrlKey } from "core/common/network";

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

export const tokensWithoutBalanceAtom = atomWithStorage<boolean>(
  "without_balance",
  true
);

export const currenciesRateAtom = atomWithStorage<Record<string, number>>(
  "currencies_rate",
  { USD: 1 }
);

export const selectedCurrencyAtom = atomWithStorage(
  "preferred_currency",
  "USD"
);

export const getNetworkAtom = atomFamily((chainId: number) =>
  atomWithRepoQuery((query) => {
    return query(() => Repo.networks.get(chainId));
  })
);

export const getRpcUrlAtom = atomFamily((chainId: number) =>
  atomWithStorage<string | null>(getRpcUrlKey(chainId), null)
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

export const getContactsAtom = atomFamily(
  (params: Repo.QueryContactsParams) =>
    atomWithRepoQuery((query) => query(() => Repo.queryContacts(params))),
  dequal
);
