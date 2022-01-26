import { livePromise } from "lib/system/livePromise";

import { StorageArea } from "../storageArea";

import { ProfileState } from "./types";

const stateKey = "state";
const profileStorage = new StorageArea("local", {
  keyMapper: (k) => `profile_${k}`,
});

export const loadState = livePromise(fetchStateForce, subscribeState);

export function fetchState() {
  return profileStorage.fetch<ProfileState>(stateKey);
}

export function fetchStateForce() {
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
