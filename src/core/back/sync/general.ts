import { storage } from "lib/ext/storage";

import { CHAIN_ID, TokenType } from "core/types";

import { syncStarted, synced } from "../state";
import { syncConversionRates } from "./currencyConversion";
import {
  enqueueTokensSync,
  syncNetworks,
  syncAccountTokens,
  refreshTotalBalances,
  isFirstSync,
} from "./tokens";

export async function addSyncRequest(
  chainId: number,
  accountAddress: string,
  tokenType: TokenType,
) {
  let syncStartedAt: number | undefined;

  setTimeout(() => {
    if (!syncStartedAt) syncStarted(accountAddress);
    syncStartedAt = Date.now();
  }, 300);

  try {
    await syncConversionRates();

    await enqueueTokensSync(accountAddress, async () => {
      const firstSync = await isFirstSync(accountAddress);
      const mostValuedChainId = await syncNetworks(accountAddress, chainId);

      await syncAccountTokens(tokenType, chainId, accountAddress);

      if (tokenType === TokenType.Asset) {
        await refreshTotalBalances(chainId, accountAddress);
      }

      if (firstSync && mostValuedChainId && mostValuedChainId !== chainId) {
        await storage.put(CHAIN_ID, mostValuedChainId);
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (syncStartedAt) {
      setTimeout(
        () => synced(accountAddress),
        Math.max(0, syncStartedAt + 1_000 - Date.now()),
      );
    } else {
      syncStartedAt = 1;
    }
  }
}
