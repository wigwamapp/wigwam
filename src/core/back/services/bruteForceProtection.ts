import { session } from "lib/ext/session";
import { getRandomInt } from "lib/system/randomInt";
import { createQueue } from "lib/system/queue";

import { WalletStatus } from "core/types";

import { locked, $walletStatus } from "../state";
import { Vault } from "../vault";

const FIREFOX = process.env.TARGET_BROWSER === "firefox";
const PU_ATTEMPS = "password_usage_attempts";

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

        if (attempts > 5) {
          if ($walletStatus.getState() !== WalletStatus.Locked) {
            locked();
          }

          await new Promise((r) => setTimeout(r, getRandomInt(2_000, 3_000)));
        }
      }

      await persistAttemps(attempts).catch(console.error);
    });
}

async function retrieveAttemps() {
  // Remove me after FF MV3 starts supporting Service Workers and storage.session
  if (FIREFOX) return +sessionStorage[PU_ATTEMPS] ?? 0;

  return (await session.fetchForce<number>(PU_ATTEMPS)) ?? 0;
}

async function persistAttemps(attempts: number) {
  // Remove me after FF MV3 starts supporting Service Workers and storage.session
  if (FIREFOX) {
    if (attempts > 0) {
      sessionStorage.setItem(PU_ATTEMPS, attempts.toString());
    } else {
      sessionStorage.removeItem(PU_ATTEMPS);
    }

    return;
  }

  return attempts > 0
    ? session.put(PU_ATTEMPS, attempts)
    : session.remove(PU_ATTEMPS);
}
