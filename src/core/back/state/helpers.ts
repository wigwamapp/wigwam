import { t } from "lib/ext/i18n";
import { retrieveSession, cleanupSession } from "lib/ext/safeSession";
import { toProtectedPassword } from "lib/crypto-utils";
import { createQueue } from "lib/system/queue";
import { assert } from "lib/system/assert";

import {
  APPROVALS_SESSION,
  Approval,
  PASSWORD_SESSION,
  WalletStatus,
} from "core/types";
import { retrieveAutoLockTimeout } from "core/common/settings";

import { $walletStatus, $vault } from "./stores";
import { inited, unlocked } from "./events";
import { RpcCtx } from "../rpc/context";
import { Vault } from "../vault";
import type { PasswordSession } from "../vault/passwordSession";

const enqueueInit = createQueue();

export async function ensureInited() {
  if ($walletStatus.getState() !== WalletStatus.Idle) return;

  await enqueueInit(async () => {
    // Check wallet status again due to queue usage
    // We can omit this step if we wrap whole `ensureInited` function
    // to `enqueueInit()`, but this way causes a huge decrease in performance
    if ($walletStatus.getState() !== WalletStatus.Idle) return;

    const [passwordSession, approvalsSession] = await Promise.all([
      retrieveSession<PasswordSession>(PASSWORD_SESSION),
      retrieveSession<Approval[]>(APPROVALS_SESSION),
    ]);

    const approvals = approvalsSession?.map((approval) => ({
      ...approval,
      rpcCtx: RpcCtx.from(approval.rpcCtx as any),
    }));

    if (passwordSession) {
      const { passwordHash, timestamp } = passwordSession;

      const autoLockTimeout = await retrieveAutoLockTimeout();

      if (autoLockTimeout === 0 || Date.now() - timestamp < autoLockTimeout) {
        try {
          await autoUnlock(passwordHash, approvals);
          return;
        } catch {}
      }

      await cleanupSession(PASSWORD_SESSION);
    }

    const PLAIN_DEV_PASSWORD = process.env.WIGWAM_DEV_UNLOCK_PASSWORD;

    if (process.env.NODE_ENV === "development" && PLAIN_DEV_PASSWORD) {
      const pass = await toProtectedPassword(PLAIN_DEV_PASSWORD);

      try {
        await autoUnlock(pass, approvals);
        return;
      } catch {}
    }

    const vaultExists = await Vault.isExist();
    inited(vaultExists);
  });
}

export async function withStatus<T>(
  status: WalletStatus | WalletStatus[],
  factory: () => T,
) {
  const state = $walletStatus.getState();
  assert(
    Array.isArray(status) ? status.includes(state) : state === status,
    t("notAllowed"),
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

async function autoUnlock(password: string, approvals?: Approval[]) {
  const vault = await Vault.unlock(password);
  const accounts = vault.getAccounts();
  const hasSeedPhrase = vault.isSeedPhraseExists();

  unlocked({ vault, accounts, hasSeedPhrase, approvals });
}
