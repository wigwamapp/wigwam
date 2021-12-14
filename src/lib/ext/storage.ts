import { StorageArea } from "./storageArea";
import { underProfile } from "./profile";

export const storage = new StorageArea("local", {
  keyMapper: underProfile,
});
