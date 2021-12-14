import memoizeOne from "memoize-one";

import { StorageArea } from "../storageArea";

import { ProfileState } from "./types";

const stateKey = "state";
const profileStorage = new StorageArea("local", {
  keyMapper: (k) => `profile_${k}`,
  obfuscate: true,
});

export const loadState = memoizeOne(async () => {
  const state = await fetchState();
  if (state) return state;

  return new Promise<ProfileState>((res) => {
    const unsub = subscribeState((newState) => {
      res(newState);
      unsub();
    });
  });
});

export function fetchState() {
  return profileStorage.fetchForce<ProfileState>(stateKey);
}

export function setState(state: ProfileState) {
  return profileStorage.put(stateKey, state);
}

export function subscribeState(callback: (state: ProfileState) => void) {
  return profileStorage.subscribe<ProfileState>(stateKey, ({ newValue }) => {
    if (newValue) {
      callback(newValue);
    }
  });
}
