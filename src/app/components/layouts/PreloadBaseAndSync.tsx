import { FC } from "react";
import { useAtomValue } from "jotai";
import { waitForAll, loadable } from "jotai/utils";

import {
  chainIdAtom,
  currentAccountAtom,
  getNetworkAtom,
  tokenTypeAtom,
} from "app/atoms";
import { ChainIdProvider, useSync, useToken } from "app/hooks";

const PreloadBaseAndSync: FC<{ chainId?: number }> = ({
  chainId: overriddenChainId,
  children,
}) => {
  const [internalChainId, currentAccount, tokenType] = useAtomValue(
    waitForAll([chainIdAtom, currentAccountAtom, tokenTypeAtom])
  );

  const chainId = overriddenChainId ?? internalChainId;

  useAtomValue(loadable(getNetworkAtom(chainId)));
  useToken(currentAccount.address);

  useSync(chainId, currentAccount.address, tokenType);

  return overriddenChainId ? (
    <ChainIdProvider chainId={overriddenChainId}>{children}</ChainIdProvider>
  ) : (
    <>{children}</>
  );
};

export default PreloadBaseAndSync;
