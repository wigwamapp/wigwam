// A wrapper over web extension session storage (`browser.storage.session`)

import { StorageArea } from "./storageArea";

export const session = new StorageArea(
  // There are no `session` area in test env
  // Use `local` instead (the same mock implementation)
  process.env.NODE_ENV !== "test" ? "session" : "local",
);
