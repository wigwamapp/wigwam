import { resource, resourceFactory } from "lib/resax";

import * as Repo from "core/repo";
import { INITIAL_NETWORK } from "fixtures/networks";

import { storageResource } from "./storage";

export const chainIdRes = storageResource<number>("chain_id", {
  fallback: INITIAL_NETWORK.chainId,
  preload: true,
});

export const accountAddressRes = storageResource<string>("account_address", {
  fallback: fetchDefaultAccountAddress,
  preload: true,
});

export const allAccountsRes = resource(() => Repo.accounts.toArray());

export const networkRes = resourceFactory(async (chainId: number) =>
  Repo.networks.get(chainId)
);

export const accountRes = resourceFactory(async (address: string) =>
  Repo.accounts.get(address)
);

async function fetchDefaultAccountAddress() {
  const allAccounts = await Repo.accounts.toArray();
  if (allAccounts.length === 0) {
    throw new Error("There are no accounts");
  }
  return allAccounts[0].address;
}
