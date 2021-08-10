import { atomFamily, atomWithDefault } from "jotai/utils";

import {
  getWalletStatus,
  isWalletHasSeedPhrase,
  onWalletStatusUpdated,
  getNeuterExtendedKey,
} from "core/client";

import { atomWithAutoReset } from "./utils";

export const walletStatusAtom = atomWithDefault(getWalletStatus);
walletStatusAtom.onMount = (setAtom) => onWalletStatusUpdated(setAtom);

export const hasSeedPhraseAtom = atomWithAutoReset(isWalletHasSeedPhrase);

export const getNeuterExtendedKeyAtom = atomFamily((derivationPath: string) =>
  atomWithAutoReset(() => getNeuterExtendedKey(derivationPath))
);
