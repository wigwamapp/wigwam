// A wrapper over web extension storage (`browser.storage.local`)
// Aims to global entities that shared between all profiles

import { StorageArea } from "./storageArea";

export const globalStorage = new StorageArea("local", {
  keyMapper: (key) => `__${key}`,
});
