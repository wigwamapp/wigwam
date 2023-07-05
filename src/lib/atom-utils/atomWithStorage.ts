import { storage } from "lib/ext/storage";

import { createAtomWithStorageArea } from "./createAtomWithStorageArea";

export const atomWithStorage = createAtomWithStorageArea(storage);
