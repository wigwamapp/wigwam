import { createStore } from "effector";

import * as Global from "lib/ext/global";
import { Setting } from "core/common";
import { WalletStatus, ForApproval } from "core/types";

import { Vault } from "../vault";
import {
  inited,
  unlocked,
  locked,
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

export const $vault = createStore<Vault | null>(null)
  .on(unlocked, (_s, vault) => vault)
  .on(locked, () => null);

export const $autoLockTimeout = createStore<MaybeTimeout>(null)
  .on(locked, (t) => {
    if (t !== null) clearTimeout(t);
    return null;
  })
  .on(walletPortsCountUpdated, (t, count) => {
    if (t !== null) clearTimeout(t);

    const timeout = count === 0 && Global.get<number>(Setting.AutoLockTimeout);
    return timeout ? setTimeout(() => locked(), timeout) : null;
  });

type MaybeTimeout = ReturnType<typeof setTimeout> | null;

export const $awaitingApproval = createStore<ForApproval[]>([]).on(
  approvalItemAdded,
  (current, item) => [...current, item]
);
