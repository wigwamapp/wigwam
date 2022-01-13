import { atom } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";
import { fetchState, subscribeState } from "lib/ext/profile";
import { getActiveTab } from "lib/ext/tab";
import { getLocale } from "lib/ext/i18n";

export const activeTabAtom = atomWithAutoReset(getActiveTab);

export const profileStateAtom = atomWithDefault(fetchState);
profileStateAtom.onMount = (setAtom) => {
  const unsub = subscribeState(setAtom);
  return () => {
    unsub();
    setAtom((v) => v);
    setAtom(RESET);
  };
};

export const currentProfileAtom = atom((get) => {
  const { all, currentId } = get(profileStateAtom);
  const index = all.findIndex((p) => p.id === currentId);
  return all[index === -1 ? 0 : index];
});

export const currentLocaleAtom = atomWithDefault(getLocale);
