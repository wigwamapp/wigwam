import { createStore } from "effector";
import { WalletStatus } from "core/types";
import { inited, unlocked, locked } from "./events";
import { Vault } from "../vault";

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
