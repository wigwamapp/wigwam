import { TokenType } from "core/types";

import { syncStarted, synced } from "../state";
import { syncConversionRates } from "./currencyConversion";
import {
  enqueueTokensSync,
  syncNetworks,
  syncAccountTokens,
  refreshTotalBalances,
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
      // Syncing never changes the active network: it is the user's choice alone
      await syncNetworks(accountAddress, chainId);

      await syncAccountTokens(tokenType, chainId, accountAddress);

      if (tokenType === TokenType.Asset) {
        await refreshTotalBalances(chainId, accountAddress);
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
