import { FC, createContext, useContext } from "react";
import { useAtomValue } from "jotai/utils";

import { chainIdAtom } from "app/atoms";

const ScopedChainIdContext = createContext(-1);

export function useChainId() {
  const globalChainId = useAtomValue(chainIdAtom);
  const scopedChainId = useContext(ScopedChainIdContext);

  return scopedChainId === -1 ? globalChainId : scopedChainId;
}

export const ChainIdProvider: FC<{ chainId: number }> = ({
  chainId,
  children,
}) => (
  <ScopedChainIdContext.Provider value={chainId}>
    {children}
  </ScopedChainIdContext.Provider>
);
