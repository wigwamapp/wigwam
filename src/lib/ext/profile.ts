import { browser } from "webextension-polyfill-ts";
import { nanoid } from "nanoid";
import memoizeOne from "memoize-one";

import { assert } from "lib/system/assert";

import { getItemSafe } from "./utils";

export interface Profile {
  id: number;
  name: string;
  avatarSeed: string;
}

export const ALL_PROFILES_LSKEY = "all_profiles";
export const PROFILE_LSKEY = "profile";
export const OPEN_TAB_LSKEY = "__open_tab";
export const DEFAULT_AVATAR_SEED_LSKEY = "__default_avatar_seed";

export const DEFAULT_PROFILE: Profile = {
  id: 0,
  name: "{{profile}} 1",
  avatarSeed: getDefaultAvatarSeed(),
};

export function underProfile(key: string) {
  return `${getProfileId()}_${key}`;
}

export const getProfileId = memoizeOne(
  () => getItemSafe<number>(PROFILE_LSKEY) ?? DEFAULT_PROFILE.id
);

export function setProfileId(id: number) {
  assert(getAllProfiles().some((p) => p.id === id));

  localStorage.setItem(PROFILE_LSKEY, JSON.stringify(id));
  localStorage.setItem(OPEN_TAB_LSKEY, "true");
  browser.runtime.reload();
}

export function openTabIfProfileChanged() {
  const openTab = localStorage.getItem(OPEN_TAB_LSKEY) === "true";
  if (openTab) {
    localStorage.removeItem(OPEN_TAB_LSKEY);
    browser.tabs.create({
      url: browser.runtime.getURL("main.html"),
      active: true,
    });
  }
}

export function addProfile(name: string) {
  const allProfiles = getAllProfiles();

  const profile: Profile = {
    name,
    id: allProfiles.length,
    avatarSeed: nanoid(),
  };
  localStorage.setItem(
    ALL_PROFILES_LSKEY,
    JSON.stringify([...allProfiles, profile])
  );

  return profile;
}

export function updateProfileName(id: number, name: string) {
  const allProfiles = getAllProfiles();
  localStorage.setItem(
    ALL_PROFILES_LSKEY,
    JSON.stringify(allProfiles.map((p) => (p.id === id ? { ...p, name } : p)))
  );
}

export function getAllProfiles() {
  return getItemSafe<Profile[]>(ALL_PROFILES_LSKEY) ?? [DEFAULT_PROFILE];
}

export function getCurrentProfile() {
  const allProfiles = getAllProfiles();
  const profileId = getProfileId();
  return allProfiles.find((p) => p.id === profileId)!;
}

function getDefaultAvatarSeed() {
  const existing = getItemSafe<string>(DEFAULT_AVATAR_SEED_LSKEY, {
    serealize: false,
  });
  if (existing) return existing;

  const seed = nanoid();
  localStorage.setItem(DEFAULT_AVATAR_SEED_LSKEY, seed);
  return seed;
}
