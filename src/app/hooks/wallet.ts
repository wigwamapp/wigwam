import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { walletStatusAtom } from "app/atoms";

export function useLocked() {
  const walletStatus = useAtomValue(walletStatusAtom);

  return walletStatus === WalletStatus.Locked;
}
