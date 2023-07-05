import { t } from "lib/ext/i18n";
import { toProtectedPassword } from "lib/crypto-utils";
import { createQueue } from "lib/system/queue";
import { assert } from "lib/system/assert";

import { WalletStatus } from "core/types";
import { retrieveAutoLockTimeout } from "core/common/settings";

import { $walletStatus, $vault } from "./stores";
import { inited, unlocked } from "./events";
import { Vault } from "../vault";
import {
  retrievePasswordSession,
  cleanupPasswordSession,
} from "../vault/session";

const enqueueInit = createQueue();

export async function ensureInited() {
  if ($walletStatus.getState() !== WalletStatus.Idle) return;

  await enqueueInit(async () => {
    // Check wallet status again due to queue usage
    // We can omit this step if we wrap whole `ensureInited` function
    // to `enqueueInit()`, but this way causes a huge decrease in performance
    if ($walletStatus.getState() !== WalletStatus.Idle) return;

    const sessioned = await retrievePasswordSession();

    if (sessioned) {
      const { passwordHash, timestamp } = sessioned;

      const autoLockTimeout = await retrieveAutoLockTimeout();

      if (autoLockTimeout === 0 || Date.now() - timestamp < autoLockTimeout) {
        try {
          await autoUnlock(passwordHash);
          return;
        } catch {}
      }

      await cleanupPasswordSession();
    }

    const PLAIN_DEV_PASSWORD = process.env.VIGVAM_DEV_UNLOCK_PASSWORD;

    if (process.env.NODE_ENV === "development" && PLAIN_DEV_PASSWORD) {
      const pass = await toProtectedPassword(PLAIN_DEV_PASSWORD);

      try {
        await autoUnlock(pass);
        return;
      } catch {}
    }

    const vaultExists = await Vault.isExist();
    inited(vaultExists);
  });
}

export async function withStatus<T>(
  status: WalletStatus | WalletStatus[],
  factory: () => T
) {
  const state = $walletStatus.getState();
  assert(
    Array.isArray(status) ? status.includes(state) : state === status,
    t("notAllowed")
  );
  return factory();
}

export async function withVault<T>(factory: (vault: Vault) => T) {
  const vault = $vault.getState();
  assert(vault instanceof Vault, t("walletLocked"));
  return factory(vault);
}

export function isUnlocked() {
  return $walletStatus.getState() === WalletStatus.Unlocked;
}

async function autoUnlock(password: string) {
  const vault = await Vault.unlock(password);
  const accounts = vault.getAccounts();
  const hasSeedPhrase = vault.isSeedPhraseExists();

  unlocked({ vault, accounts, hasSeedPhrase });
}
