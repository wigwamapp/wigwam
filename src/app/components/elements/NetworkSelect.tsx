import { FC, useMemo } from "react";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";

import { chainIdAtom, getAllMainNetworksAtom } from "app/atoms";
import { NETWORK_ICON_MAP } from "fixtures/networks";

import Select from "./Select";

type NetworkSelectProps = {
  className?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({ className }) => {
  const [chainId, setChainId] = useAtom(chainIdAtom);
  const networks = useAtomValue(getAllMainNetworksAtom);

  const preparedNetworks = useMemo(
    () =>
      networks.map((network) => ({
        key: network.chainId,
        value: network.name,
        icon: NETWORK_ICON_MAP.get(network.chainId),
      })),
    [networks]
  );

  const currentNetwork = useMemo(
    () => preparedNetworks.find(({ key }) => key === chainId)!,
    [chainId, preparedNetworks]
  );

  return (
    <Select
      items={preparedNetworks}
      currentItem={currentNetwork}
      setItem={(network) => setChainId(network.key)}
      className={className}
    />
  );
};

export default NetworkSelect;
