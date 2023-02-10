// A wrapper over web extension storage (`browser.storage.local`)
// Aims to profile entities only

import { StorageArea } from "./storageArea";
import { underProfile } from "./profile";

export const storage = new StorageArea("local", {
  keyMapper: underProfile,
});
