import { FC, useMemo, useState } from "react";
import Fuse from "fuse.js";

import { Network } from "core/types";
import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { NETWORK_ICON_MAP } from "fixtures/networks";

import Select from "app/components/elements/Select";
import NewSelect from "./NewSelect";

const prepareNetwork = (network: Network) => ({
  key: network.chainId,
  value: network.name,
  icon: NETWORK_ICON_MAP.get(network.chainId),
});

type NetworkSelectProps = {
  networks: Network[];
  currentNetwork: Network;
  onNetworkChange: (chainId: number) => void;
  className?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
};

const NetworkSelectPrimitive: FC<NetworkSelectProps> = ({
  networks,
  currentNetwork,
  onNetworkChange,
  className,
  currentItemClassName,
  currentItemIconClassName,
}) => {
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
    <NewSelect
      items={preparedNetworks}
      currentItem={preparedCurrentNetwork}
      setItem={(network) => onNetworkChange(network.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      className={className}
      scrollAreaClassName="h-64"
      currentItemClassName={currentItemClassName}
      currentItemIconClassName={currentItemIconClassName}
      modal={true}
    />
  );
};

export default NetworkSelectPrimitive;
