import { useAtomValue } from "jotai";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { Network } from "core/types";

import { lazyNetworkAtom } from "app/atoms";

import { useChainId } from "./chainId";

export function useNetwork() {
  const chainId = useChainId();
  const network = useAtomValue(lazyNetworkAtom(chainId));

  return network.state === "hasData" ? network.data : undefined;
}

export function useLazyNetwork(): Network | undefined;
export function useLazyNetwork(fallback: Network): Network;
export function useLazyNetwork(fallback?: Network) {
  const network = useNetwork();
  const prevNetwork = usePrevious(network);

  return network ?? prevNetwork ?? fallback;
}

export function useNativeCurrency() {
  return useNetwork()?.nativeCurrency;
}
