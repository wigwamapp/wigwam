import * as Repo from "core/repo";
import { INITIAL_NETWORK } from "fixtures/networks";
import { query } from "./base";

import { useStorageQuery } from "./storage";

export function useChainIdQuery() {
  return useStorageQuery<number>("chain_id", INITIAL_NETWORK.chainId);
}

export function useAccountAddressQuery() {
  return useStorageQuery<string>("account_address", fetchDefaultAccountAddress);
}

export const allAccountsQuery = query({
  queryKey: "all-accounts",
  queryFn: () => Repo.accounts.toArray(),
});

export const networkQuery = (chainId: number) =>
  query({
    queryKey: ["network", chainId],
    queryFn: () => Repo.networks.get(chainId),
  });

export const accountQuery = (address: string) =>
  query({
    queryKey: ["account", address],
    queryFn: () => Repo.accounts.get(address),
  });

async function fetchDefaultAccountAddress() {
  const allAccounts = await Repo.accounts.toArray();
  if (allAccounts.length === 0) {
    throw new Error("There are no accounts");
  }
  return allAccounts[0].address;
}
