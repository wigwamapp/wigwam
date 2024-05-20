import { useCallback, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

import { getClientProvider } from "core/client";

import { useChainId } from "./chainId";

export function useProvider() {
  const chainId = useChainId();
  return getClientProvider(chainId);
}

export type UseOnBlockOptions = {
  debounceWait?: number;
  callFirstTime?: boolean;
};

export function useOnBlock(
  callback: (blockNumber: number) => void,
  opts: UseOnBlockOptions = {},
) {
  const provider = useProvider();

  const latestBlockRef = useRef<number>();
  const handleNewBlock = useCallback(
    (blockNumber: number) => {
      if (
        (!latestBlockRef.current && opts.callFirstTime) ||
        (latestBlockRef.current && blockNumber > latestBlockRef.current)
      ) {
        callback(blockNumber);
      }

      latestBlockRef.current = blockNumber;
    },
    [callback, opts.callFirstTime],
  );

  const debouncedCallback = useDebouncedCallback(
    handleNewBlock,
    opts.debounceWait ?? 500,
  );

  useEffect(() => {
    provider.on("block", debouncedCallback);

    return () => {
      provider.off("block", debouncedCallback);
    };
  }, [provider, debouncedCallback]);
}
