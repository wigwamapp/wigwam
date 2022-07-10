import { atom } from "jotai";
import { atomWithDefault, selectAtom } from "jotai/utils";
import { atomWithAutoReset, atomWithGlobal } from "lib/atom-utils";
import { loadState, subscribeState } from "lib/ext/profile";
import { getActiveTab } from "lib/ext/tab";
import { getLocale } from "lib/ext/i18n";
import { isUpdateAvailable } from "lib/ext/utils";

export const currentLocaleAtom = atomWithDefault(getLocale);

export const activeTabAtom = atomWithDefault(getActiveTab);

export const activeTabOriginAtom = selectAtom(
  activeTabAtom,
  (tab) => tab?.url && new URL(tab.url).origin
);

export const profileStateAtom = atomWithAutoReset(loadState, {
  onMount: subscribeState,
});

export const currentProfileAtom = atom((get) => {
  const { all, currentId } = get(profileStateAtom);
  const index = all.findIndex((p) => p.id === currentId);
  return all[index === -1 ? 0 : index];
});

export const latestVersionAtom = atomWithGlobal(
  "latest_version",
  process.env.VERSION
);

export const updateAvailableAtom = selectAtom(
  latestVersionAtom,
  (latestVersion) => isUpdateAvailable(process.env.VERSION, latestVersion)
);
