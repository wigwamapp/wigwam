import { lazyNetworkAtom } from "app/atoms";
import { useAtomValue } from "jotai/utils";

import { useChainId } from "./chainId";

export function useLazyNetwork() {
  const chainId = useChainId();
  const network = useAtomValue(lazyNetworkAtom(chainId));
  return network.state === "hasData" ? network.data : undefined;
}

export function useNativeCurrency() {
  return useLazyNetwork()?.nativeCurrency;
}
