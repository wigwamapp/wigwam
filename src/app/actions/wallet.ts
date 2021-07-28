import * as Client from "core/client";

import {
  hasSeedPhraseRes,
  allAccountsRes,
  accountAddressRes,
} from "app/resources";

export const addSeedPhrase = withEffect(Client.addSeedPhrase, () => {
  hasSeedPhraseRes.put(true);
});

export const setupWallet = withEffect(Client.setupWallet, () =>
  Promise.all([
    hasSeedPhraseRes.refresh(),
    allAccountsRes.refresh(),
    accountAddressRes.refresh(),
  ])
);

function withEffect<Args extends any[], Result>(
  factory: (...args: Args) => Promise<Result>,
  effect: (result: Result) => Promise<any> | void
) {
  return async (...args: Args) => {
    const result = await factory(...args);
    await effect(result);
    return result;
  };
}
