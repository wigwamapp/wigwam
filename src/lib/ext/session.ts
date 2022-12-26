// A wrapper over web extension session storage (`browser.storage.session`)

import { StorageArea } from "./storageArea";

export const session = new StorageArea("session");
