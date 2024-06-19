import { atomFamily, atomWithDefault } from "jotai/utils";
import { dequal } from "dequal/lite";
import {
  atomWithAutoReset,
  atomWithClientStorage,
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
import { indexerApi } from "core/common/indexerApi";
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

export const getAppliedForRewardsAtom = atomFamily((address: string) =>
  atomWithDefault(() =>
    indexerApi
      .get<{ applied: boolean }>(`/activity/check/${address}`)
      .then((res) => res.data?.applied)
      .catch(() => "error" as const),
  ),
);

export const rewardsApplicationAtom = atomWithClientStorage<string>(
  "rewards-application",
  "",
);

export const tgApplicationAtom = atomWithClientStorage<string>(
  "tg-application",
  "",
);

export const allEvmNetworksAtom = atomWithDefault(getAllEvmNetworks);
