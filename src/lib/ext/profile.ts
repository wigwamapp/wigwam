import browser from "webextension-polyfill";
import { nanoid, customAlphabet } from "nanoid";
import memoizeOne from "memoize-one";

import { assert } from "lib/system/assert";

import { getItemSafe, getMainURL } from "./utils";

export interface Profile {
  id: string;
  name: string;
  avatarSeed: string;
}

export const DEFAULT_PROFILE_NAME = "{{profile}} 1";

export const ALL_PROFILES_LSKEY = "all_profiles";
export const PROFILE_LSKEY = "profile";
export const OPEN_TAB_LSKEY = "__open_tab";

const getDefaultProfile = memoizeOne(() => {
  if (ALL_PROFILES_LSKEY in localStorage) {
    return getItemSafe<Profile[]>(ALL_PROFILES_LSKEY)![0];
  }

  const defaultProfile = generateProfile(DEFAULT_PROFILE_NAME);
  localStorage.setItem(ALL_PROFILES_LSKEY, JSON.stringify([defaultProfile]));
  return defaultProfile;
});

export function underProfile(key: string) {
  return `${getProfileId()}_${key}`;
}

export const getProfileId = memoizeOne(
  () => localStorage.getItem(PROFILE_LSKEY) ?? getDefaultProfile().id
);

export function setProfileId(id: string) {
  assert(getAllProfiles().some((p) => p.id === id));

  localStorage.setItem(PROFILE_LSKEY, id);
  localStorage.setItem(OPEN_TAB_LSKEY, "true");
  browser.runtime.reload();
}

export function openTabIfProfileChanged() {
  const openTab = localStorage.getItem(OPEN_TAB_LSKEY) === "true";
  if (openTab) {
    localStorage.removeItem(OPEN_TAB_LSKEY);
    browser.tabs.create({
      url: getMainURL(),
      active: true,
    });
  }
}

export function addProfile(name: string) {
  const allProfiles = getAllProfiles();
  const profile = generateProfile(name);

  localStorage.setItem(
    ALL_PROFILES_LSKEY,
    JSON.stringify([...allProfiles, profile])
  );

  return profile;
}

export function updateProfile(
  id: string,
  { name, avatarSeed }: Omit<Profile, "id">
) {
  const allProfiles = getAllProfiles();
  localStorage.setItem(
    ALL_PROFILES_LSKEY,
    JSON.stringify(
      allProfiles.map((p) => (p.id === id ? { ...p, name, avatarSeed } : p))
    )
  );
}

export function getAllProfiles() {
  return getItemSafe<Profile[]>(ALL_PROFILES_LSKEY) ?? [getDefaultProfile()];
}

export function getCurrentProfile() {
  const allProfiles = getAllProfiles();
  const profileId = getProfileId();

  return allProfiles.find((p) => p.id === profileId)!;
}

function generateProfile(name: string): Profile {
  const id = generateProfileId();
  const avatarSeed = nanoid();

  return { id, name, avatarSeed };
}

const generateProfileId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  11
);
