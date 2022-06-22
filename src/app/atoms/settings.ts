import { atomWithGlobal, atomWithStorage } from "lib/atom-utils";

import { Setting, AnalyticsState } from "core/common";

export const testNetworksAtom = atomWithStorage(Setting.TestNetworks, false);

export const analyticsAtom = atomWithStorage<AnalyticsState>(
  Setting.Analytics,
  { enabled: false }
);

export const betaTestCodeAtom = atomWithGlobal("betatest_promocode", "");

export const betaTestEnabledAtom = atomWithGlobal("betatest_enabled", "false");
