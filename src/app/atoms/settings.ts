import { atomWithStorage } from "lib/atom-utils";

import {
  DEFAULT_AUTO_LOCK_TIMEOUT,
  DEFAULT_WEB_METAMASK_COMPATIBLE,
} from "fixtures/settings";
import { Setting } from "core/common";

export const autoLockTimeoutAtom = atomWithStorage(
  Setting.AutoLockTimeout,
  DEFAULT_AUTO_LOCK_TIMEOUT,
);

export const web3MetaMaskCompatibleAtom = atomWithStorage(
  Setting.Web3MetaMaskCompatible,
  DEFAULT_WEB_METAMASK_COMPATIBLE,
);

export const testNetworksAtom = atomWithStorage(Setting.TestNetworks, false);

export const profileBlockedUntilAtom = atomWithStorage<number>(
  Setting.ProfileBlockedUntil,
  0,
);

export const swapVerifiedTokensAtom = atomWithStorage<boolean>(
  Setting.SwapVerifiedTokens,
  true,
);
