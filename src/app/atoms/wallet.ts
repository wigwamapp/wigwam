import { atomFamily, selectAtom } from "jotai/utils";
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

import { activeTabAtom } from "./ext";

export const walletStateAtom = atomWithAutoReset(getWalletState, {
  onMount: onWalletStateUpdated,
});

export const walletStatusAtom = selectAtom(
  walletStateAtom,
  ({ status }) => status
);

export const hasSeedPhraseAtom = selectAtom(
  walletStateAtom,
  ({ hasSeedPhrase }) => hasSeedPhrase
);

export const getNeuterExtendedKeyAtom = atomFamily((derivationPath: string) =>
  atomWithAutoReset(() => getNeuterExtendedKey(derivationPath))
);

export const syncStatusAtom = atomWithAutoReset(getSyncStatus, {
  onMount: onSyncStatusUpdated,
});

export const getLocalNonceAtom = atomFamily(
  ({ chainId, accountAddress }: { chainId: number; accountAddress: string }) =>
    atomWithStorage<string | null>(
      nonceStorageKey(chainId, accountAddress),
      null
    ),
  dequal
);

export const activePermissionAtom = atomWithRepoQuery((query, get) => {
  const activeTab = get(activeTabAtom);
  const origin = activeTab?.url && new URL(activeTab.url).origin;

  return query(() => repo.permissions.where({ origin }).first());
});
