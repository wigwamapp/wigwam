import { assert } from "lib/system/assert";

import { Profile } from "./types";
import { loadState, fetchState, setState } from "./state";
import { generateProfile } from "./helpers";

import { restartApp } from "../utils";

/**
 * Used to generate keys for other storage entities.
 */
export async function underProfile(key: string) {
  const currentId = await getProfileId();
  return `${currentId}${key}`;
}

export async function getProfileId() {
  const { currentId } = await loadState();
  return currentId;
}

export async function changeProfile(id: string) {
  const state = await fetchState();

  assert(
    state.all.some((p) => p.id === id),
    "Profile not found",
  );

  await setState({
    ...state,
    currentId: id,
  });

  restartApp();
}

export async function addProfile(name: string, profileSeed?: string) {
  const state = await fetchState();

  const profile = generateProfile(name, profileSeed);

  await setState({
    ...state,
    all: [...state.all, profile],
  });

  return profile;
}

export async function updateProfile(id: string, toUpdate: Omit<Profile, "id">) {
  const state = await fetchState();

  await setState({
    ...state,
    all: state.all.map((p) => (p.id === id ? { ...p, ...toUpdate } : p)),
  });
}

export async function appendProfile(profile: Profile) {
  const state = await fetchState();

  await setState({
    ...state,
    all: [...state.all, profile],
  });
}

export async function assertProfileNotExist(id: string) {
  const state = await fetchState();

  assert(
    state.all.every((p) => p.id !== id),
    "Profile already exists",
  );
}
