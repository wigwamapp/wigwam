import { storage } from "lib/ext/storage";

import { Setting, getNetwork } from "core/common";
import { CHAIN_ID } from "core/types";
import { INITIAL_NETWORK } from "fixtures/networks";

export function startAutoNetworkChanger() {
  storage.subscribe<boolean>(Setting.TestNetworks, async ({ newValue }) => {
    if (newValue === false) {
      const currentChainId = await storage.fetchForce<number>(CHAIN_ID);

      if (currentChainId) {
        const net = await getNetwork(currentChainId);

        if (net.type !== "mainnet") {
          storage.put(CHAIN_ID, INITIAL_NETWORK.chainId);
        }
      }
    }
  });
}
