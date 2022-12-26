import { session } from "lib/ext/session";
import { getRandomInt } from "lib/system/randomInt";
import { createQueue } from "lib/system/queue";

import { locked } from "../state";
import { Vault } from "../vault";

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
          locked();
          await new Promise((r) => setTimeout(r, getRandomInt(2_000, 3_000)));
        }
      }

      const persistPromise =
        attempts > 0
          ? session.put(PU_ATTEMPS, attempts)
          : session.remove(PU_ATTEMPS);

      await persistPromise.catch(console.error);
    });
}

async function retrieveAttemps() {
  return (await session.fetchForce<number>(PU_ATTEMPS)) ?? 0;
}
