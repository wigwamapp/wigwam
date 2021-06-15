import { browser } from "webextension-polyfill-ts";

export interface Profile {
  id: number;
  name: string;
}

export const ALL_PROFILES_LSKEY = "allprofiles";
export const PROFILE_LSKEY = "profile";
export const OPEN_TAB_LSKEY = "opentab";

export const DEFAULT_PROFILE: Profile = {
  id: 0,
  name: "Default",
};

const currentProfileId = getProfileId();

export function underProfile(key: string) {
  return `${currentProfileId}_${key}`;
}

export function getProfileId() {
  try {
    const value = localStorage.getItem(PROFILE_LSKEY);
    if (value) {
      return JSON.parse(value) as number;
    }
  } catch {}

  return DEFAULT_PROFILE.id;
}

export function setProfileId(id: number) {
  localStorage.setItem(PROFILE_LSKEY, JSON.stringify(id));
  localStorage.setItem(OPEN_TAB_LSKEY, "true");
  browser.runtime.reload();
}

export function openTabIfProfileChanged() {
  const openTab = localStorage.getItem(OPEN_TAB_LSKEY) === "true";
  if (openTab) {
    localStorage.removeItem(OPEN_TAB_LSKEY);
    browser.tabs.create({
      url: browser.runtime.getURL("index.html"),
      active: true,
    });
  }
}

export function addProfile(name: string) {
  const allProfiles = getAllProfiles();
  localStorage.setItem(
    ALL_PROFILES_LSKEY,
    JSON.stringify([
      ...allProfiles,
      {
        id: allProfiles.length,
        name,
      },
    ])
  );
}

export function updateProfileName(id: number, name: string) {
  const allProfiles = getAllProfiles();
  localStorage.setItem(
    ALL_PROFILES_LSKEY,
    JSON.stringify(allProfiles.map((p) => (p.id === id ? { ...p, name } : p)))
  );
}

export function getAllProfiles() {
  const allProfiles = (() => {
    try {
      const value = localStorage.getItem(ALL_PROFILES_LSKEY);
      if (value) {
        return JSON.parse(value) as Profile[];
      }
    } catch {}

    return null;
  })();

  return allProfiles ?? [DEFAULT_PROFILE];
}
