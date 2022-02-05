import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { atomWithAutoReset } from "lib/atom-utils";
import { loadState, subscribeState } from "lib/ext/profile";
import { getActiveTab } from "lib/ext/tab";
import { getLocale } from "lib/ext/i18n";

export const currentLocaleAtom = atomWithDefault(getLocale);

export const activeTabAtom = atomWithDefault(getActiveTab);

export const profileStateAtom = atomWithAutoReset(loadState, {
  onMount: subscribeState,
});

export const currentProfileAtom = atom((get) => {
  const { all, currentId } = get(profileStateAtom);
  const index = all.findIndex((p) => p.id === currentId);
  return all[index === -1 ? 0 : index];
});
