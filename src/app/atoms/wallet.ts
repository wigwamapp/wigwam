import { atomFamily, atomWithDefault } from "jotai/utils";
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

export const getNeuterExtendedKeyAtom = atomFamily((derivationPath: string) =>
  atomWithAutoReset(() => getNeuterExtendedKey(derivationPath))
);
