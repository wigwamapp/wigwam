import { getClientProvider } from "core/client";

import { useChainId } from "./chainId";

export function useProvider() {
  const chainId = useChainId();
  return getClientProvider(chainId);
}
