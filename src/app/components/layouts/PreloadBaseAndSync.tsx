import { FC, PropsWithChildren } from "react";
import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { useAtomsAll } from "lib/atom-utils";

import {
  accountAddressAtom,
  allAccountsAtom,
  chainIdAtom,
  getNetworkAtom,
  tokenTypeAtom,
  allNetworksAtom,
} from "app/atoms";
import { ChainIdProvider, useAccounts, useSync, useToken } from "app/hooks";

const PreloadBaseAndSync: FC<PropsWithChildren<{ chainId?: number }>> = ({
  chainId: overriddenChainId,
  children,
}) => {
  const [internalChainId, tokenType] = useAtomsAll([
    chainIdAtom,
    tokenTypeAtom,
    allAccountsAtom,
    accountAddressAtom,
    allNetworksAtom,
  ]);
  const { currentAccount } = useAccounts();

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
