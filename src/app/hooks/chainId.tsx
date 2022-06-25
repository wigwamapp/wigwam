import { FC, createContext, useContext, useEffect } from "react";
import { useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";
import { useDocumentVisibility } from "lib/react-hooks/useDocumentVisibility";

import { sync, syncTokenActivities } from "core/client";

import { chainIdAtom, syncStatusAtom } from "app/atoms";

const ScopedChainIdContext = createContext<number | null>(null);

export function useChainId() {
  const globalChainId = useAtomValue(chainIdAtom);
  const scopedChainId = useContext(ScopedChainIdContext);

  return scopedChainId === null ? globalChainId : scopedChainId;
}

export const ChainIdProvider: FC<{ chainId: number }> = ({
  chainId,
  children,
}) => (
  <ScopedChainIdContext.Provider value={chainId}>
    {children}
  </ScopedChainIdContext.Provider>
);

export function useIsSyncing() {
  const chainId = useChainId();
  const status = useLazyAtomValue(syncStatusAtom) ?? [];

  return status.includes(chainId);
}

export function useSync(chainId: number, accountAddress: string) {
  const isHidden = useDocumentVisibility();

  useEffect(() => {
    let t: any;

    const syncAndDefer = () => {
      sync(chainId, accountAddress);

      t = setTimeout(syncAndDefer, 3_000);
    };

    if (!isHidden) {
      t = setTimeout(syncAndDefer);
    }

    return () => clearTimeout(t);
  }, [chainId, isHidden, accountAddress]);
}

export function useTokenActivitiesSync(
  chainId: number,
  accountAddress: string,
  tokenSlug?: string
) {
  const isHidden = useDocumentVisibility();

  useEffect(() => {
    let t: any;

    const syncAndDefer = () => {
      tokenSlug && syncTokenActivities(chainId, accountAddress, tokenSlug);

      t = setTimeout(syncAndDefer, 5_000);
    };

    if (!isHidden) {
      t = setTimeout(syncAndDefer, 500);
    }

    return () => clearTimeout(t);
  }, [chainId, accountAddress, tokenSlug, isHidden]);
}
