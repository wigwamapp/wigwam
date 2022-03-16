import { FC, createContext, useContext } from "react";
import { useAtomValue } from "jotai";

import { chainIdAtom, syncStatusAtom } from "app/atoms";
import { useLazyAtomValue } from "lib/atom-utils";

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
