import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import {
  atomWithAutoReset,
  atomWithRepoQuery,
  atomWithStorage,
} from "lib/atom-utils";

import * as repo from "core/repo";
import {
  getWalletStatus,
  isWalletHasSeedPhrase,
  onWalletStatusUpdated,
  getNeuterExtendedKey,
  getSyncStatus,
  onSyncStatusUpdated,
} from "core/client";
import { nonceStorageKey } from "core/common/nonce";

import { activeTabAtom } from "./ext";

export const walletStatusAtom = atomWithAutoReset(getWalletStatus, {
  onMount: onWalletStatusUpdated,
});

export const hasSeedPhraseAtom = atomWithAutoReset(() =>
  isWalletHasSeedPhrase().catch(() => false)
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
