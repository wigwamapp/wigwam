import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { atomWithAutoReset, atomWithGlobalStorage } from "lib/atom-utils";
import { loadState, subscribeState } from "lib/ext/profile";
import { getActiveTab } from "lib/ext/tab";
import { getLocale } from "lib/ext/i18n";
import { isUpdateAvailable } from "lib/ext/utils";

import { LATEST_VERSION } from "core/types/storage";

export const currentLocaleAtom = atom(getLocale);

export const activeTabAtom = atom(getActiveTab);

export const activeTabOriginAtom = selectAtom(
  activeTabAtom,
  (tab) => tab?.url && new URL(tab.url).origin,
);

export const profileStateAtom = atomWithAutoReset(loadState, {
  onMount: subscribeState,
});

export const currentProfileAtom = atom(async (get) => {
  const { all, currentId } = await get(profileStateAtom);
  const index = all.findIndex((p) => p.id === currentId);
  return all[index === -1 ? 0 : index];
});

export const latestVersionAtom = atomWithGlobalStorage(
  LATEST_VERSION,
  process.env.VERSION,
);

export const updateAvailableAtom = selectAtom(
  latestVersionAtom,
  (latestVersion) => isUpdateAvailable(process.env.VERSION, latestVersion),
);
