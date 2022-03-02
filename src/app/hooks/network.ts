import { Atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { allNetworksAtom, getNetworkAtom } from "app/atoms";

import { useChainId } from "./chainId";

export function useLazyAllNetworks() {
  return useLazy(allNetworksAtom);
}

export function useLazyNetwork(previous = true) {
  const chainId = useChainId();
  const networkAtom = getNetworkAtom(chainId);

  return useLazy(networkAtom, previous);
}

export function useNativeCurrency() {
  return useLazyNetwork(false)?.nativeCurrency;
}

function useLazy<T>(atom: Atom<T>, previous = true) {
  const value = useAtomValue(loadable(atom));

  const data = value.state === "hasData" ? value.data : undefined;
  const prevData = usePrevious(previous ? data : undefined);

  return data ?? prevData;
}
