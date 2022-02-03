import { atomWithDefault } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";

import {
  getWalletStatus,
  isWalletHasSeedPhrase,
  onWalletStatusUpdated,
  getNeuterExtendedKey,
} from "core/client";

export const walletStatusAtom = atomWithDefault(getWalletStatus);
walletStatusAtom.onMount = (setAtom) => onWalletStatusUpdated(setAtom);

export const hasSeedPhraseAtom = atomWithAutoReset(() =>
  isWalletHasSeedPhrase().catch(() => false)
);

export const neuterExtendedKeyAtom = atomWithAutoReset(getNeuterExtendedKey);
