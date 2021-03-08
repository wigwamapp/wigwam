import create from "zustand/vanilla";
import { assert } from "lib/system/assert";
import { WalletStatus } from "core/types";
import { Vault } from "./vault";

export type State = {
  status: WalletStatus;
  vault: Vault | null;
  init: (vaultExists: boolean) => void;
  unlock: (vault: Vault) => void;
  lock: () => void;
};

export type UnlockedState = State & {
  status: WalletStatus.Ready;
  vault: Vault;
};

export type NotReadyState = State & {
  status: WalletStatus.Idle | WalletStatus.Welcome | WalletStatus.Locked;
  vault: null;
};

const store = create<State>((set) => ({
  status: WalletStatus.Idle,
  vault: null,
  init: (vaultExists) =>
    set({
      status: vaultExists ? WalletStatus.Locked : WalletStatus.Welcome,
      vault: null,
    }),
  unlock: (vault) => set({ status: WalletStatus.Ready, vault }),
  lock: () =>
    set((s) => ({
      status: s.status === WalletStatus.Ready ? WalletStatus.Locked : s.status,
      vault: null,
    })),
}));

export async function ensureInited() {
  const state = store.getState();
  if (state.status === WalletStatus.Idle) {
    const vaultExists = await Vault.isExist();
    state.init(vaultExists);
  }
}

export function getStatus() {
  const { status } = store.getState();
  return status;
}

export function withUnlocked<T>(factory: (state: UnlockedState) => T) {
  const state = store.getState();
  assertUnlocked(state);
  return factory(state);
}

export function withNotReady<T>(factory: (state: NotReadyState) => T) {
  const state = store.getState();
  assertNotReady(state);
  return factory(state);
}

export function assertUnlocked(state: State): asserts state is UnlockedState {
  assert(
    state.status === WalletStatus.Ready && state.vault instanceof Vault,
    "Wallet locked"
  );
}

export function assertNotReady(state: State): asserts state is NotReadyState {
  assert(state.status !== WalletStatus.Ready, "Disallowed for unlocked wallet");
}
