import { FC } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { chainIdAtom, currentAccountAtom } from "app/atoms";
import { ChainIdProvider, useSync } from "app/hooks";

const PreloadBaseAndSync: FC<{ chainId?: number }> = ({
  chainId: overriddenChainId,
  children,
}) => {
  const [internalChainId, currentAccount] = useAtomValue(
    waitForAll([chainIdAtom, currentAccountAtom])
  );

  useSync(overriddenChainId ?? internalChainId, currentAccount.address);

  return overriddenChainId ? (
    <ChainIdProvider chainId={overriddenChainId}>{children}</ChainIdProvider>
  ) : (
    <>{children}</>
  );
};

export default PreloadBaseAndSync;
