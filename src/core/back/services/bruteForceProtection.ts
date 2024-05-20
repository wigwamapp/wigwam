import { session } from "lib/ext/session";
import { storage } from "lib/ext/storage";
import { getRandomInt } from "lib/system/randomInt";
import { createQueue } from "lib/system/queue";

import {
  MAX_PASSWORD_ATTEMPTS_BEFORE_BLOCK,
  BLOCK_PROFILE_FOR,
} from "fixtures/settings";
import { WalletStatus } from "core/types";
import { Setting } from "core/common/settings";

import { locked, $walletStatus } from "../state";
import { Vault } from "../vault";

export function startBruteForceProtection() {
  const enqueue = createQueue();

  let attempts = 0;

  Vault.onPasswordUsage = (success) =>
    enqueue(async () => {
      attempts = Math.max(attempts, await retrieveAttemps());

      if (success) {
        attempts = 0;
      } else {
        attempts++;

        if (attempts > 4) {
          await new Promise((r) => setTimeout(r, getRandomInt(2_000, 3_000)));

          if ($walletStatus.getState() !== WalletStatus.Locked) {
            locked();
          }

          if (attempts > MAX_PASSWORD_ATTEMPTS_BEFORE_BLOCK) {
            await storage.put(
              Setting.ProfileBlockedUntil,
              Date.now() + BLOCK_PROFILE_FOR,
            );

            attempts = 0;
          }
        }
      }

      const persistPromise =
        attempts > 0
          ? session.put(Setting.PasswordUsageAttempts, attempts)
          : session.remove(Setting.PasswordUsageAttempts);

      await persistPromise.catch(console.error);
    });

  Vault.ensureNotBlocked = async () => {
    const blockedUntil = await storage.fetchForce<number>(
      Setting.ProfileBlockedUntil,
    );

    if (blockedUntil && blockedUntil > Date.now()) {
      throw new Error("Profile blocked");
    }
  };
}

async function retrieveAttemps() {
  return (await session.fetchForce<number>(Setting.PasswordUsageAttempts)) ?? 0;
}
