import { atomFamily } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";

import {
  getWalletStatus,
  isWalletHasSeedPhrase,
  onWalletStatusUpdated,
  getNeuterExtendedKey,
  getSyncStatus,
  onSyncStatusUpdated,
} from "core/client";

export const walletStatusAtom = atomWithAutoReset(getWalletStatus, {
  onMount: onWalletStatusUpdated,
});

export const hasSeedPhraseAtom = atomWithAutoReset(() =>
  isWalletHasSeedPhrase().catch(() => false)
);

export const getNeuterExtendedKeyAtom = atomFamily((derivationPath: string) =>
  atomWithAutoReset(() => getNeuterExtendedKey(derivationPath))
);

export const syncStatusAtom = atomWithAutoReset(getSyncStatus, {
  onMount: onSyncStatusUpdated,
});
