import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { walletStateAtom } from "app/atoms";

export function useLocked() {
  const { walletStatus } = useAtomValue(walletStateAtom);

  return walletStatus === WalletStatus.Locked;
}
