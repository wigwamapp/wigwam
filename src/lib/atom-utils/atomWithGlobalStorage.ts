import { globalStorage } from "lib/ext/globalStorage";

import { createAtomWithStorageArea } from "./createAtomWithStorageArea";

export const atomWithGlobalStorage = createAtomWithStorageArea(globalStorage);
