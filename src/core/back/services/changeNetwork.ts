import BigNumber from "bignumber.js";
import { storage } from "lib/ext/storage";

import { NATIVE_TOKEN_SLUG, Setting, getNetwork } from "core/common";
import { ACCOUNT_ADDRESS, AccountToken, CHAIN_ID } from "core/types";
import * as repo from "core/repo";
import { INITIAL_NETWORK } from "fixtures/networks";

import { $accountAddresses } from "../state";

export function startAutoNetworkChanger() {
  storage.subscribe<boolean>(Setting.TestNetworks, async ({ newValue }) => {
    if (newValue === false) {
      const [currentChainId, accountAddress] = await Promise.all([
        storage.fetchForce<number>(CHAIN_ID),
        storage
          .fetch<string>(ACCOUNT_ADDRESS)
          .catch(() => $accountAddresses.getState()[0]),
      ]);

      if (currentChainId) {
        const net = await getNetwork(currentChainId);

        if (net.type !== "mainnet") {
          let highNetNativeToken: AccountToken | undefined;

          const accNativeTokens = await repo.accountTokens
            .where("[accountAddress+tokenSlug]")
            .equals([accountAddress, NATIVE_TOKEN_SLUG])
            .toArray();

          for (const nativeToken of accNativeTokens) {
            if (!nativeToken.portfolioUSD) continue;

            const bal = new BigNumber(nativeToken.portfolioUSD);
            if (bal.isZero()) continue;

            if (
              !highNetNativeToken ||
              bal.isGreaterThan(nativeToken.portfolioUSD!)
            ) {
              highNetNativeToken = nativeToken;
            }
          }

          storage.put(
            CHAIN_ID,
            (highNetNativeToken ?? INITIAL_NETWORK).chainId,
          );
        }
      }
    }
  });
}
