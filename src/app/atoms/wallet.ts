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

export const neuterExtendedKeyAtom = atomWithAutoReset(getNeuterExtendedKey);

export const syncStatusAtom = atomWithAutoReset(getSyncStatus, {
  onMount: onSyncStatusUpdated,
});
