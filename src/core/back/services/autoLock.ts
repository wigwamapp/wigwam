import { Setting } from "core/common";
import { storage } from "lib/ext/storage";

import { DEFAULT_AUTO_LOCK_TIMEOUT } from "fixtures/settings";

import { locked, walletPortsCountUpdated } from "../state";

export function startAutoLocker() {
  let t: ReturnType<typeof setTimeout>;

  locked.watch(() => clearTimeout(t));

  walletPortsCountUpdated.watch(async (count) => {
    clearTimeout(t);

    if (count === 0) {
      const timeout =
        (await storage.fetchForce<number>(Setting.AutoLockTimeout)) ??
        DEFAULT_AUTO_LOCK_TIMEOUT;

      if (timeout !== 0) {
        t = setTimeout(locked, timeout);
      }
    }
  });
}
