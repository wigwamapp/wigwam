import { FC } from "react";
import { useAtomValue } from "jotai";
import { waitForAll, loadable } from "jotai/utils";

import { chainIdAtom, currentAccountAtom, getNetworkAtom } from "app/atoms";
import { ChainIdProvider, useSync, useToken } from "app/hooks";

const PreloadBaseAndSync: FC<{ chainId?: number }> = ({
  chainId: overriddenChainId,
  children,
}) => {
  const [internalChainId, currentAccount] = useAtomValue(
    waitForAll([chainIdAtom, currentAccountAtom])
  );

  const chainId = overriddenChainId ?? internalChainId;

  useAtomValue(loadable(getNetworkAtom(chainId)));
  useToken(currentAccount.address);

  useSync(chainId, currentAccount.address);

  return overriddenChainId ? (
    <ChainIdProvider chainId={overriddenChainId}>{children}</ChainIdProvider>
  ) : (
    <>{children}</>
  );
};

export default PreloadBaseAndSync;
