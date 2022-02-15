import { FC, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import Fuse from "fuse.js";

import { INetwork } from "core/repo";
import { chainIdAtom, allNetworksAtom } from "app/atoms";
import { useLazyNetwork } from "app/hooks";
import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { NETWORK_ICON_MAP } from "fixtures/networks";

import Select from "./Select";

const prepareNetwork = (network: INetwork) => ({
  key: network.chainId,
  value: network.name,
  icon: NETWORK_ICON_MAP.get(network.chainId),
});

type NetworkSelectProps = {
  className?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({ className }) => {
  const networks = useAtomValue(allNetworksAtom);
  const currentNetwork = useLazyNetwork(networks[0]);

  const setChainId = useSetAtom(chainIdAtom);

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const fuse = useMemo(
    () => new Fuse(networks, NETWORK_SEARCH_OPTIONS),
    [networks]
  );

  const preparedNetworks = useMemo(() => {
    if (searchValue) {
      return fuse
        .search(searchValue)
        .map(({ item: network }) => prepareNetwork(network));
    } else {
      return networks.map((network) => prepareNetwork(network));
    }
  }, [fuse, networks, searchValue]);

  const preparedCurrentNetwork = useMemo(
    () => prepareNetwork(currentNetwork),
    [currentNetwork]
  );

  return (
    <Select
      items={preparedNetworks}
      currentItem={preparedCurrentNetwork}
      setItem={(network) => setChainId(network.key)}
      onSearch={(value) => setSearchValue(value === "" ? null : value)}
      className={className}
    />
  );
};

export default NetworkSelect;
