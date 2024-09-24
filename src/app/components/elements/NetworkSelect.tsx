import { FC, useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import { useLazyAtomValue } from "lib/atom-utils";

import { compareNetworks } from "core/common/network";

import { chainIdAtom, getAllNativeTokensAtom } from "app/atoms";
import { useLazyAllNetworks, useChainId, useAccounts } from "app/hooks";
import NetworkSelectPrimitive from "app/components/elements/NetworkSelectPrimitive";

type NetworkSelectProps = {
  className?: string;
  currentItemClassName?: string;
  currentListItemClassName?: string;
  currentItemIconClassName?: string;
  contentClassName?: string;
  withAction?: boolean;
  onChange?: (chainId: number) => void;
  changeInternalChainId?: boolean;
  size?: "large" | "small";
  source?: string;
  withFiat?: boolean;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  className,
  currentItemClassName,
  currentListItemClassName,
  currentItemIconClassName,
  contentClassName,
  withAction,
  onChange,
  changeInternalChainId = true,
  size = "large",
  source,
  withFiat,
}) => {
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
        ? (allNetworksPure ?? [])
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

  const setChainId = useSetAtom(chainIdAtom);

  const handleNetworkChange = useCallback(
    (chainId: number) => {
      if (changeInternalChainId) setChainId(chainId);
      onChange?.(chainId);
    },
    [changeInternalChainId, setChainId, onChange],
  );

  return (
    <NetworkSelectPrimitive
      networks={allNetworks}
      currentNetwork={currentNetwork}
      onNetworkChange={handleNetworkChange}
      className={className}
      withAction={withAction}
      size={size}
      source={source}
      withFiat={withFiat}
      currentItemClassName={classNames(
        size === "small" ? "h-[1.75rem]" : "h-12",
        currentItemClassName,
      )}
      currentListItemClassName={classNames(
        "!bg-brand-main/20 border-2 border-[#80EF6E]",
        size === "small" ? "!py-1.5" : "!py-2",
        currentListItemClassName,
      )}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
    />
  );
};

export default NetworkSelect;
