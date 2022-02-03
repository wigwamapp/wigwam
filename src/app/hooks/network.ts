import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai/utils";

import { lazyNetworkAtom } from "app/atoms";

import { useChainId } from "./chainId";
import { INetwork } from "core/repo";

export function useNetwork() {
  const chainId = useChainId();
  const network = useAtomValue(lazyNetworkAtom(chainId));

  return network.state === "hasData" ? network.data : undefined;
}

export function useLazyNetwork(): INetwork | undefined;
export function useLazyNetwork(fallback: INetwork): INetwork;
export function useLazyNetwork(fallback?: INetwork) {
  const network = useNetwork();
  const prevNetworkRef = useRef(network);

  useEffect(() => {
    if (network) {
      prevNetworkRef.current = network;
    }
  }, [network]);

  return network ?? prevNetworkRef.current ?? fallback;
}

export function useNativeCurrency() {
  return useNetwork()?.nativeCurrency;
}
