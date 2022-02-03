import { createStore } from "effector";

import { WalletStatus, ForApproval, Account } from "core/types";

import { Vault } from "../vault";
import {
  inited,
  unlocked,
  locked,
  accountsUpdated,
  walletPortsCountUpdated,
  approvalItemAdded,
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

export const $awaitingApproval = createStore<ForApproval[]>([]).on(
  approvalItemAdded,
  (current, item) => [...current, item]
);
