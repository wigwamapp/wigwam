import create from "zustand/vanilla";
import { assert } from "lib/system/assert";
import { WalletStatus } from "core/types";
import { Vault } from "./vault";

// export async function unlock(password: string) {
//   const vault = await Vault.unlock(password);
//   store.getState().unlock(vault);
// }

// export async function lock() {
//   store.getState().lock();
// }

export async function initIfNeeded() {
  const state = store.getState();
  if (state.status === WalletStatus.Idle) {
    const vaultExists = await Vault.isExist();
    store.getState().init(vaultExists);
  }
}

export function withUnlocked<T>(factory: (state: UnlockedState) => T) {
  const state = store.getState();
  assertUnlocked(state);
  return factory(state);
}

export function assertUnlocked(state: State): asserts state is UnlockedState {
  assert(
    state.status === WalletStatus.Ready && state.vault instanceof Vault,
    "Wallet locked"
  );
}

export type UnlockedState = State & {
  status: WalletStatus.Ready;
  vault: Vault;
};

type State = {
  status: WalletStatus;
  vault: Vault | null;
  init: (vaultExists: boolean) => void;
  unlock: (vault: Vault) => void;
  lock: () => void;
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
