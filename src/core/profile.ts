export interface Profile {
  id: number;
  name: string;
}

export const ALL_PROFILES_LSKEY = "allprofiles";
export const PROFILE_LSKEY = "profile";
export const DEFAULT_PROFILE: Profile = {
  id: 0,
  name: "Default",
};

export function profileId() {
  return getProfile().id;
}

export function getProfile() {
  try {
    const value = localStorage.getItem(PROFILE_LSKEY);
    if (value) {
      return JSON.parse(value) as Profile;
    }
  } catch {}

  return DEFAULT_PROFILE;
}

export function setProfile(p: Profile) {
  localStorage.setItem(PROFILE_LSKEY, JSON.stringify(p));
}

export function addProfile(p: Profile) {
  const allProfiles = getAllProfiles();
  localStorage.setItem(ALL_PROFILES_LSKEY, JSON.stringify([...allProfiles, p]));
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
