import { Account, TokenType } from "core/types";

import { $accounts, syncStarted, synced } from "../state";
import { syncConversionRates } from "./currencyConversion";
import {
  syncAccountTokens,
  syncNativeTokens,
  enqueueTokensSync,
} from "./tokens";

export async function addSyncRequest(
  chainId: number,
  accountAddress: string,
  tokenType: TokenType,
) {
  let syncStartedAt: number | undefined;

  setTimeout(() => {
    if (!syncStartedAt) syncStarted(chainId);
    syncStartedAt = Date.now();
  }, 300);

  try {
    await syncConversionRates();

    await enqueueTokensSync(chainId, async () => {
      await syncAccountTokens(chainId, accountAddress, tokenType);

      const allAccounts = $accounts.getState();

      let currentAccount: Account | undefined;
      const restAccounts: Account[] = [];

      for (const acc of allAccounts) {
        if (acc.address === accountAddress) {
          currentAccount = acc;
        } else {
          restAccounts.push(acc);
        }
      }

      if (!currentAccount) return;

      await syncNativeTokens(
        chainId,
        `current_${accountAddress}`,
        currentAccount.address,
      );

      await syncNativeTokens(
        chainId,
        `rest_${allAccounts.length}`,
        restAccounts.map((acc) => acc.address),
      );
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (syncStartedAt) {
      setTimeout(
        () => synced(chainId),
        Math.max(0, syncStartedAt + 1_000 - Date.now()),
      );
    } else {
      syncStartedAt = 1;
    }
  }
}
