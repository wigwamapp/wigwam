import { locked, walletPortsCountUpdated } from "../state";

import { retrieveAutoLockTimeout } from "core/common/settings";

export function startAutoLocker() {
  let t: ReturnType<typeof setTimeout>;

  locked.watch(() => clearTimeout(t));

  walletPortsCountUpdated.watch(async (count) => {
    clearTimeout(t);

    if (count === 0) {
      const timeout = await retrieveAutoLockTimeout();

      if (timeout !== 0) {
        t = setTimeout(locked, timeout);
      }
    }
  });
}
