import { getPasswordHash } from "lib/crypto-utils/hash";

import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import { WalletStatus } from "core/types";

import { Vault } from "../vault";

import { $walletStatus, $vault } from "./stores";
import { inited, unlocked } from "./events";

export async function ensureInited() {
  const state = $walletStatus.getState();
  if (state === WalletStatus.Idle) {
    const vaultExists = await Vault.isExist();
    inited(vaultExists);
  }

  // Auto Unlock
  const PASSWORD = process.env.VIGVAM_DEV_UNLOCK_PASSWORD;

  if (process.env.NODE_ENV === "development" && PASSWORD) {
    await autoUnlock(PASSWORD).catch(console.error);
  }
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

async function autoUnlock(password: string) {
  const passwordHash = getPasswordHash(password);
  const vault = await Vault.unlock(passwordHash);
  unlocked(vault);
}
