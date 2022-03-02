import { FC, Suspense } from "react";
import { useSetAtom } from "jotai";

import { INITIAL_NETWORK } from "fixtures/networks";

import { chainIdAtom } from "app/atoms";
import { useLazyNetwork, useLazyAllNetworks } from "app/hooks";
import NetworkSelectPrimitive from "app/components/elements/NetworkSelectPrimitive";

type NetworkSelectProps = {
  className?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  className,
  currentItemClassName,
  currentItemIconClassName,
}) => {
  const currentNetwork = useLazyNetwork() ?? INITIAL_NETWORK;
  const allNetworks = useLazyAllNetworks() ?? [];

  const setChainId = useSetAtom(chainIdAtom);

  return (
    <NetworkSelectPrimitive
      networks={allNetworks}
      currentNetwork={currentNetwork}
      onNetworkChange={setChainId}
      className={className}
      currentItemClassName={currentItemClassName}
      currentItemIconClassName={currentItemIconClassName}
    />
  );
};

const WrappedNetworkSelect: FC<NetworkSelectProps> = (props) => (
  <Suspense fallback={null}>
    <NetworkSelect {...props} />
  </Suspense>
);

export default WrappedNetworkSelect;
