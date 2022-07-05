import { atomWithGlobal, atomWithStorage } from "lib/atom-utils";

import { DEFAULT_AUTO_LOCK_TIMEOUT } from "fixtures/settings";
import { Setting, AnalyticsState } from "core/common";

export const autoLockTimeout = atomWithStorage(
  Setting.AutoLockTimeout,
  DEFAULT_AUTO_LOCK_TIMEOUT
);

export const testNetworksAtom = atomWithStorage(Setting.TestNetworks, true);

export const analyticsAtom = atomWithStorage<AnalyticsState>(
  Setting.Analytics,
  { enabled: false }
);

export const betaTestCodeAtom = atomWithGlobal("betatest_promocode", "");

export const betaTestEnabledAtom = atomWithGlobal("betatest_enabled", "false");
