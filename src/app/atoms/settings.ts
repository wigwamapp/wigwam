import { atomWithStorage } from "lib/atom-utils";

import { Setting } from "core/common";

export const testNetworksAtom = atomWithStorage(Setting.TestNetworks, false);
