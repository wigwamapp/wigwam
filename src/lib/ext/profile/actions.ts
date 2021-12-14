import browser from "webextension-polyfill";
import { assert } from "lib/system/assert";

import { Profile } from "./types";
import { loadState, setState } from "./state";
import { generateProfile } from "./helpers";

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
  const state = await loadState();

  assert(
    state.all.some((p) => p.id === id),
    "Profile not found"
  );

  await setState({
    ...state,
    currentId: id,
    openTab: true,
  });

  browser.runtime.reload();
}

export async function addProfile(name: string) {
  const state = await loadState();

  const profile = generateProfile(name);

  await setState({
    ...state,
    all: [...state.all, profile],
  });

  loadState.clear();

  return profile;
}

export async function updateProfile(id: string, toUpdate: Omit<Profile, "id">) {
  const state = await loadState();

  await setState({
    ...state,
    all: state.all.map((p) => (p.id === id ? { ...p, ...toUpdate } : p)),
  });

  loadState.clear();
}
