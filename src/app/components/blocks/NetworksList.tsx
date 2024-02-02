import { FC, useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useLazyAtomValue } from "lib/atom-utils";

import { Network } from "core/types";

import { getNetworkIconUrl } from "fixtures/networks";
import { chainIdAtom, getAllNativeTokensAtom } from "app/atoms";
import { useLazyAllNetworks, useChainId, useAccounts } from "app/hooks";
import NetworkCard from "app/components/elements/NetworkCard";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";

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
      accountNativeTokens &&
      new Map(accountNativeTokens.map((t) => [t.chainId, t.portfolioUSD])),
    [accountNativeTokens],
  );

  const allNetworks = useMemo(
    () =>
      !balancesMap?.size
        ? allNetworksPure ?? []
        : (allNetworksPure ?? [])
            .map((n) => ({
              ...n,
              balanceUSD: balancesMap?.get(n.chainId),
            }))
            .sort(compareNetworks),
    [allNetworksPure, balancesMap],
  );

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
    <div className="flex gap-3 py-4 border-b border-brand-main/[.07] min-h-[6.666rem]">
      {shownNetworks.map((network) => (
        <NetworkCard
          key={network.chainId}
          network={network}
          isActive={network.chainId === currentNetwork.chainId}
          onClick={() => handleNetworkChange(network.chainId)}
        />
      ))}
      <div
        className={classNames(
          "px-4 py-3",
          "rounded-[.625rem]",
          "w-full",
          "border-transparent bg-brand-main/5 hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
          "flex items-center gap-3",
          "text-base font-bold",
        )}
      >
        <div className="flex items-center">
          {dropdownNetworks.slice(0, 3).map((network, index) => (
            <img
              key={network.chainId}
              src={getNetworkIconUrl(network)}
              alt={network.name}
              className={classNames("w-8 h-8", index !== 0 ? "-ml-2.5" : "")}
            />
          ))}
        </div>
        {dropdownNetworks.length} more
        <ChevronDownIcon
          className={classNames(
            "w-6 min-w-[1.5rem]",
            "h-auto",
            "ml-auto",
            "transition-transform",
          )}
        />
      </div>
    </div>
  );
};

export default NetworksList;

function compareNetworks(a: Network, b: Network) {
  if (a.balanceUSD && b.balanceUSD) {
    return new BigNumber(a.balanceUSD).isGreaterThan(b.balanceUSD) ? -1 : 1;
  } else if (a.balanceUSD && !b.balanceUSD) {
    return -1;
  } else if (b.balanceUSD && !a.balanceUSD) {
    return 1;
  } else {
    return 0;
  }
}
