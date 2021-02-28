import create from "zustand/vanilla";
import { WalletStatus } from "core/types";
import { Vault } from "./vault";

type State = {
  status: WalletStatus;
  vault: Vault | null;
  init: (vaultExists: boolean) => void;
  unlock: (vault: Vault) => void;
  lock: () => void;
};

const store = create<State>((set) => ({
  status: WalletStatus.NotInited,
  vault: null,
  init: (vaultExists) =>
    set({
      status: vaultExists ? WalletStatus.Locked : WalletStatus.Idle,
      vault: null,
    }),
  unlock: (vault) => set({ status: WalletStatus.Ready, vault }),
  lock: () =>
    set((s) => ({
      status: s.status === WalletStatus.Ready ? WalletStatus.Locked : s.status,
      vault: null,
    })),
}));

export async function init() {
  const vaultExists = await Vault.isExist();
  store.getState().init(vaultExists);
}

export async function unlock(password: string) {
  const vault = await Vault.unlock(password);
  store.getState().unlock(vault);
}

export async function lock() {
  store.getState().lock();
}
