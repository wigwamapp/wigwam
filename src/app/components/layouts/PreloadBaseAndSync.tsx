import { FC, PropsWithChildren, useEffect } from "react";
import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { useAtomsAll } from "lib/atom-utils";
import { isPopup } from "lib/ext/view";

import { TEvent, trackEvent } from "core/client";
import { getNetwork } from "core/common";

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

  useEffect(() => {
    const latestChainId = localStorage.getItem("latestChainId");
    if (!latestChainId || latestChainId !== chainId.toString()) {
      localStorage.setItem("latestChainId", chainId.toString());

      getNetwork(chainId)
        .then((net) => {
          trackEvent(TEvent.NetworkChange, {
            name: net.name,
            chainId,
            page: isPopup() ? "popup" : "dashboard",
          });
        })
        .catch(console.error);
    }
  }, [chainId]);

  return overriddenChainId ? (
    <ChainIdProvider chainId={overriddenChainId}>{children}</ChainIdProvider>
  ) : (
    <>{children}</>
  );
};

export default PreloadBaseAndSync;
