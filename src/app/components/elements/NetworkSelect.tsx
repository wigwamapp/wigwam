import { FC, Suspense } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { allNetworksAtom, chainIdAtom } from "app/atoms";
import { useLazyNetwork } from "app/hooks";
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
  const networks = useAtomValue(allNetworksAtom);
  const currentNetwork = useLazyNetwork(networks[0]);

  const setChainId = useSetAtom(chainIdAtom);

  return (
    <NetworkSelectPrimitive
      networks={networks}
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
