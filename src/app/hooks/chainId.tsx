import { FC, createContext, useContext, useEffect } from "react";
import { useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";

import { sync } from "core/client";

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
  const windowFocused = useWindowFocus();

  useEffect(() => {
    let t: any;

    const syncAndDefer = () => {
      sync(chainId, accountAddress);

      t = setTimeout(syncAndDefer, 1_500);
    };

    if (windowFocused) {
      t = setTimeout(syncAndDefer);
    }

    return () => clearTimeout(t);
  }, [chainId, windowFocused, accountAddress]);
}
