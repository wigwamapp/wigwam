import { useAtomValue } from "jotai/utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

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
  const prevNetwork = usePrevious(network);

  return network ?? prevNetwork ?? fallback;
}

export function useNativeCurrency() {
  return useNetwork()?.nativeCurrency;
}
