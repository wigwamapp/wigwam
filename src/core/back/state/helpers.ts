import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import { WalletStatus } from "core/types";

import { $walletStatus, $vault } from "./stores";
import { inited } from "./events";
import { Vault } from "../vault";

export async function ensureInited() {
  const state = $walletStatus.getState();
  if (state === WalletStatus.Idle) {
    const vaultExists = await Vault.isExist();
    inited(vaultExists);
  }
}

export async function withStatus<T>(
  status: WalletStatus | WalletStatus[],
  factory: () => T
) {
  const state = $walletStatus.getState();
  console.info(state, status);
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
