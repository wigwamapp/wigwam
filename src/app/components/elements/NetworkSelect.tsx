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
  onChange?: (chainId: number) => void;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  className,
  currentItemClassName,
  currentItemIconClassName,
  contentClassName,
  onChange,
}) => {
  const currentNetwork = useLazyNetwork();
  const allNetworks = useLazyAllNetworks() ?? [];

  const setChainId = useSetAtom(chainIdAtom);

  const handleNetworkChange = useCallback(
    (chainId: number) => {
      setChainId(chainId);
      onChange?.(chainId);
    },
    [setChainId, onChange]
  );

  return (
    <NetworkSelectPrimitive
      networks={allNetworks}
      currentNetwork={currentNetwork}
      onNetworkChange={handleNetworkChange}
      className={className}
      currentItemClassName={classNames("h-12", currentItemClassName)}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
    />
  );
};

export default NetworkSelect;
