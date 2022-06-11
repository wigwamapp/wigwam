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
  small?: boolean;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  className,
  currentItemClassName,
  currentItemIconClassName,
  contentClassName,
  withAction,
  onChange,
  changeInternalChainId = true,
  small,
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
      className={classNames(small && "!min-w-0 w-[10.5rem]", className)}
      withAction={withAction}
      currentItemClassName={classNames(
        small ? "h-[1.75rem]" : "h-12",
        currentItemClassName
      )}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
    />
  );
};

export default NetworkSelect;
