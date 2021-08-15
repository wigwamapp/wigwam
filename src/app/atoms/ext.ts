import { atomWithAutoReset } from "lib/atom-utils";
import { getActiveTab } from "lib/ext/tab";

export const activeTabAtom = atomWithAutoReset(getActiveTab);
