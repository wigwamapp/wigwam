import { storage } from "lib/ext/storage";

import { Setting, getNetwork } from "core/common";
import { CHAIN_ID } from "core/types";
import { INITIAL_NETWORK } from "fixtures/networks";

/**
 * The one case where the active network changes on its own: the user hides
 * test networks while sitting on one. Falls back to Ethereum, never to a
 * network guessed from balances — picking the active network is the user's job.
 */
export function startAutoNetworkChanger() {
  storage.subscribe<boolean>(Setting.TestNetworks, async ({ newValue }) => {
    if (newValue !== false) return;

    const currentChainId = await storage.fetchForce<number>(CHAIN_ID);
    if (!currentChainId) return;

    const net = await getNetwork(currentChainId).catch(() => null);

    if (net && net.type !== "mainnet") {
      await storage.put(CHAIN_ID, INITIAL_NETWORK.chainId);
    }
  });
}
