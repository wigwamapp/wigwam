import { FC } from "react";
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
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  className,
  currentItemClassName,
  currentItemIconClassName,
  contentClassName,
}) => {
  const currentNetwork = useLazyNetwork();
  const allNetworks = useLazyAllNetworks() ?? [];

  const setChainId = useSetAtom(chainIdAtom);

  return (
    <NetworkSelectPrimitive
      networks={allNetworks}
      currentNetwork={currentNetwork}
      onNetworkChange={setChainId}
      className={className}
      currentItemClassName={classNames("h-12", currentItemClassName)}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
    />
  );
};

export default NetworkSelect;
