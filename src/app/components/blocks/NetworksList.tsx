import { FC, useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import { useLazyAtomValue } from "lib/atom-utils";

import { compareNetworks } from "core/common/network";

import { chainIdAtom, getAllNativeTokensAtom } from "app/atoms";
import { useLazyAllNetworks, useChainId, useAccounts } from "app/hooks";

import NetworkCard from "../elements/NetworkCard";
import NetworkIcon from "../elements/NetworkIcon";

import NetworksButton from "./NetworksButton";

const SHOWN_NETWORKS_AMOUNT = 3;

const NetworksList: FC = () => {
  const chainId = useChainId();
  const allNetworksPure = useLazyAllNetworks();

  const { currentAccount } = useAccounts();
  const accountNativeTokens = useLazyAtomValue(
    getAllNativeTokensAtom(currentAccount.address),
    "off",
  );

  const balancesMap = useMemo(
    () =>
      accountNativeTokens
        ? new Map(accountNativeTokens.map((t) => [t.chainId, t.portfolioUSD]))
        : null,
    [accountNativeTokens],
  );

  const allNetworks = useMemo(() => {
    if (!allNetworksPure || !balancesMap) return [];
    if (balancesMap.size === 0) return allNetworksPure;

    return allNetworksPure
      .map((n) => ({
        ...n,
        balanceUSD: balancesMap?.get(n.chainId),
      }))
      .sort(compareNetworks);
  }, [allNetworksPure, balancesMap]);

  const currentNetwork =
    allNetworks.find((n) => n.chainId === chainId) ?? allNetworks[0];

  const { shownNetworks, dropdownNetworks } = useMemo(() => {
    const tempNetworks = allNetworks.slice(0, SHOWN_NETWORKS_AMOUNT);
    if (!currentNetwork || tempNetworks.includes(currentNetwork))
      return {
        shownNetworks: tempNetworks,
        dropdownNetworks: allNetworks.slice(SHOWN_NETWORKS_AMOUNT),
      };

    return {
      shownNetworks: [
        ...tempNetworks.slice(0, SHOWN_NETWORKS_AMOUNT - 1),
        currentNetwork,
      ],
      dropdownNetworks: allNetworks
        .filter((network) => network.chainId !== currentNetwork.chainId)
        .slice(SHOWN_NETWORKS_AMOUNT - 1),
    };
  }, [allNetworks, currentNetwork]);

  const setChainId = useSetAtom(chainIdAtom);
  const handleNetworkChange = useCallback(
    (chainId: number) => {
      setChainId(chainId);
    },
    [setChainId],
  );

  return (
    <div className="flex gap-3 py-4 border-b border-brand-main/[.07] min-h-[6.2rem]">
      {shownNetworks.map((network) => (
        <NetworkCard
          key={network.chainId}
          network={network}
          isActive={network.chainId === currentNetwork.chainId}
          onClick={() => handleNetworkChange(network.chainId)}
          className="!w-1/4"
        />
      ))}

      <NetworksButton className="!w-1/4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {dropdownNetworks.slice(0, 3).map((network, index) => (
              <NetworkIcon
                key={network.chainId}
                network={network}
                className={classNames("w-8 h-8", index !== 0 ? "-ml-3" : "")}
              />
            ))}
          </div>
          <span className="truncate min-w-0">
            {dropdownNetworks.length} more
          </span>
        </div>
      </NetworksButton>
    </div>
  );
};

export default NetworksList;
