import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";
import { useDocumentVisibility } from "lib/react-hooks/useDocumentVisibility";

import { TokenType } from "core/types";
import { sync, syncTokenActivities } from "core/client";
import { createAccountTokenKey } from "core/common/tokens";

import { chainIdAtom, syncStatusAtom } from "app/atoms";
import { useAccounts } from "./account";

const ScopedChainIdContext = createContext<number | null>(null);

export function useChainId() {
  const globalChainId = useAtomValue(chainIdAtom);
  const scopedChainId = useContext(ScopedChainIdContext);

  return scopedChainId === null ? globalChainId : scopedChainId;
}

export const ChainIdProvider: FC<PropsWithChildren<{ chainId: number }>> = ({
  chainId,
  children,
}) => (
  <ScopedChainIdContext.Provider value={chainId}>
    {children}
  </ScopedChainIdContext.Provider>
);

export function useIsSyncing() {
  const { currentAccount } = useAccounts();
  const status = useSyncStatus();

  return status.includes(currentAccount.address);
}

export function useIsTokenActivitySyncing(
  chainId: number,
  accountAddress: string,
  tokenSlug?: string,
) {
  const status = useSyncStatus();
  const syncKey = useMemo(
    () =>
      tokenSlug &&
      createAccountTokenKey({ chainId, accountAddress, tokenSlug }),
    [chainId, accountAddress, tokenSlug],
  );

  return syncKey ? status.includes(syncKey) : false;
}

export function useSync(
  chainId: number,
  accountAddress: string,
  tokenType = TokenType.Asset,
) {
  const isHidden = useDocumentVisibility();

  useEffect(() => {
    let t: any;

    const syncAndDefer = () => {
      sync(chainId, accountAddress, tokenType);

      t = setTimeout(syncAndDefer, 3_000);
    };

    if (!isHidden) {
      t = setTimeout(syncAndDefer);
    }

    return () => clearTimeout(t);
  }, [isHidden, chainId, accountAddress, tokenType]);
}

export function useTokenActivitiesSync(
  chainId: number,
  accountAddress: string,
  tokenSlug?: string,
) {
  const isHidden = useDocumentVisibility();

  useEffect(() => {
    let t: any;

    const syncAndDefer = () => {
      if (tokenSlug) syncTokenActivities(chainId, accountAddress, tokenSlug);

      t = setTimeout(syncAndDefer, 5_000);
    };

    if (!isHidden) {
      t = setTimeout(syncAndDefer, 500);
    }

    return () => clearTimeout(t);
  }, [chainId, accountAddress, tokenSlug, isHidden]);
}

function useSyncStatus() {
  return useLazyAtomValue(syncStatusAtom) ?? [];
}
