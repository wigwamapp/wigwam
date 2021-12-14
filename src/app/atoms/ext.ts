import { atom } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";
import { loadState, subscribeState } from "lib/ext/profile";
import { getActiveTab } from "lib/ext/tab";

export const activeTabAtom = atomWithAutoReset(getActiveTab);

export const profileStateAtom = atomWithDefault(loadState);
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
