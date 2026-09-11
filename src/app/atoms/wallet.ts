import { atomFamily, atomWithDefault } from "jotai/utils";
import { dequal } from "dequal/lite";
import {
  atomWithAutoReset,
  atomWithRepoQuery,
  atomWithStorage,
} from "lib/atom-utils";

import * as repo from "core/repo";
import {
  getWalletState,
  onWalletStateUpdated,
  getNeuterExtendedKey,
  getSyncStatus,
  onSyncStatusUpdated,
} from "core/client";
import { nonceStorageKey } from "core/common/nonce";
import { getAllEvmNetworks } from "core/common/chainList";

export const walletStateAtom = atomWithAutoReset(getWalletState, {
  onMount: onWalletStateUpdated,
});

export const getNeuterExtendedKeyAtom = atomFamily((derivationPath: string) =>
  atomWithAutoReset(() => getNeuterExtendedKey(derivationPath)),
);

export const syncStatusAtom = atomWithAutoReset(getSyncStatus, {
  onMount: onSyncStatusUpdated,
});

export const getLocalNonceAtom = atomFamily(
  ({ chainId, accountAddress }: { chainId: number; accountAddress: string }) =>
    atomWithStorage<string | null>(
      nonceStorageKey(chainId, accountAddress),
      null,
    ),
  dequal,
);

export const getPermissionAtom = atomFamily((origin?: string) =>
  atomWithRepoQuery((query) =>
    query(() => repo.permissions.get(origin || "<stub>")),
  ),
);

export const getTrustedDappAtom = atomFamily((origin?: string) =>
  atomWithRepoQuery((query) =>
    query(() => repo.trustedDapps.get(origin || "<stub>")),
  ),
);

export const allEvmNetworksAtom = atomWithDefault(getAllEvmNetworks);
