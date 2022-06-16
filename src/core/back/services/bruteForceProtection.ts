import { getRandomInt } from "lib/system/randomInt";

import { locked } from "../state";
import { Vault } from "../vault";

export function startBruteForceProtection() {
  let attempts = +sessionStorage.passwordUsageAttempts || 0;

  Vault.onPasswordUsage = async (success) => {
    if (success) {
      attempts = 0;
    } else {
      attempts++;

      if (attempts > 5) {
        locked();
        await new Promise((r) => setTimeout(r, getRandomInt(2_000, 3_000)));
      }
    }

    sessionStorage.passwordUsageAttempts = attempts;
  };
}
