import { useEffect } from "react";

import { getClientProvider } from "core/client";

import { useChainId } from "./chainId";

export function useProvider() {
  const chainId = useChainId();
  return getClientProvider(chainId);
}

export function useOnBlock(callback: (blockNumber: number) => void) {
  const provider = useProvider();

  useEffect(() => {
    provider.on("block", callback);

    return () => {
      provider.off("block", callback);
    };
  }, [provider, callback]);
}
