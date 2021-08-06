import { atom } from "jotai";
import { atomFamily, atomWithDefault, RESET } from "jotai/utils";

import {
  getWalletStatus,
  isWalletHasSeedPhrase,
  onWalletStatusUpdated,
  getNeuterExtendedKey,
} from "core/client";

import { atomWithAutoReset } from "./utils";
import { allAccountsAtom, getAccountAddressAtom } from "./common";

export const walletStatusAtom = atomWithDefault(getWalletStatus);
walletStatusAtom.onMount = (setAtom) => onWalletStatusUpdated(setAtom);

export const hasSeedPhraseAtom = atomWithAutoReset(isWalletHasSeedPhrase);

export const neuterExtendedKeyAtomFamily = atomFamily(
  (derivationPath: string) =>
    atomWithAutoReset(() => getNeuterExtendedKey(derivationPath))
);

export const refreshAfterAddAccountsAtom = atom(null, (_get, set) => {
  set(allAccountsAtom, []);
  set(allAccountsAtom, RESET);

  set(getAccountAddressAtom, "");
  set(getAccountAddressAtom, RESET);
});
