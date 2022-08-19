import { FC, useCallback } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";

import { chainIdAtom } from "app/atoms";
import { useLazyNetwork, useLazyAllNetworks } from "app/hooks";
import NetworkSelectPrimitive from "app/components/elements/NetworkSelectPrimitive";

type NetworkSelectProps = {
  className?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
  contentClassName?: string;
  withAction?: boolean;
  onChange?: (chainId: number) => void;
  changeInternalChainId?: boolean;
  size?: "large" | "small";
  source?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  className,
  currentItemClassName,
  currentItemIconClassName,
  contentClassName,
  withAction,
  onChange,
  changeInternalChainId = true,
  size = "large",
  source,
}) => {
  const currentNetwork = useLazyNetwork();
  const allNetworks = useLazyAllNetworks() ?? [];

  const setChainId = useSetAtom(chainIdAtom);

  const handleNetworkChange = useCallback(
    (chainId: number) => {
      changeInternalChainId && setChainId(chainId);
      onChange?.(chainId);
    },
    [changeInternalChainId, setChainId, onChange]
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
      currentItemClassName={classNames(
        size === "small" ? "h-[1.75rem]" : "h-12",
        currentItemClassName
      )}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
    />
  );
};

export default NetworkSelect;
