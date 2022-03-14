import { createStore } from "effector";

import { WalletStatus, Approval, Account } from "core/types";

import { Vault } from "../vault";
import {
  inited,
  unlocked,
  locked,
  accountsUpdated,
  walletPortsCountUpdated,
  approvalAdded,
  approvalResolved,
  syncStarted,
  synced,
} from "./events";

export const $walletStatus = createStore(WalletStatus.Idle)
  .on(inited, (_s, vaultExists) =>
    vaultExists ? WalletStatus.Locked : WalletStatus.Welcome
  )
  .on(unlocked, () => WalletStatus.Unlocked)
  .on(locked, (state) =>
    state === WalletStatus.Unlocked ? WalletStatus.Locked : state
  );

export const $accounts = createStore<Account[]>([])
  .on(unlocked, (_s, { accounts }) => accounts)
  .on(accountsUpdated, (_s, accounts) => accounts)
  .on(locked, () => []);

export const $vault = createStore<Vault | null>(null)
  .on(unlocked, (_s, { vault }) => vault)
  .on(locked, (prevVault) => {
    prevVault?.cleanup();

    return null;
  });

export const $autoLockTimeout = createStore<MaybeTimeout>(null)
  .on(locked, (t) => {
    if (t !== null) clearTimeout(t);
    return null;
  })
  .on(walletPortsCountUpdated, (t, count) => {
    if (t !== null) clearTimeout(t);

    const timeout = count === 0 && 0; /*Global.get(Setting.AutoLockTimeout)*/
    return timeout ? setTimeout(() => locked(), +timeout) : null;
  });

type MaybeTimeout = ReturnType<typeof setTimeout> | null;

export const $syncPool = createStore<number[]>([])
  .on(syncStarted, (pool, chainId) => [...pool, chainId])
  .on(synced, (pool, chainId) => {
    const i = pool.indexOf(chainId);

    if (i > -1) {
      // Remove one element by index
      const copied = Array.from(pool);
      copied.splice(i, 1);
      return copied;
    }

    return pool;
  });

export const $syncStatus = $syncPool.map((pool) => Array.from(new Set(pool)));

export const $approvals = createStore<Approval[]>([])
  .on(approvalAdded, (current, item) => [...current, item])
  .on(approvalResolved, (current, approvalId) =>
    current.filter((a) => a.id !== approvalId)
  )
  .on(locked, () => []);
