import { FC, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { useAtomValue, waitForAll } from "jotai/utils";
import Fuse from "fuse.js";

import { INetwork } from "core/repo";
import {
  chainIdAtom,
  getAllMainNetworksAtom,
  getCurrentNetworkAtom,
} from "app/atoms";
import { NETWORK_ICON_MAP } from "fixtures/networks";

import Select from "./Select";

const searchOptions = {
  includeScore: true,
  keys: [
    {
      name: "name",
      weight: 1,
    },
    {
      name: "chainTag",
      weight: 2,
    },
    {
      name: "chainId",
      weight: 2,
    },
    {
      name: "nativeCurrency.name",
      weight: 3,
    },
    {
      name: "nativeCurrency.symbol",
      weight: 3,
    },
    {
      name: "rpcUrls.value",
      weight: 4,
    },
    {
      name: "type",
      weight: 4,
    },
  ],
};

const prepareNetwork = (network: INetwork) => ({
  key: network.chainId,
  value: network.name,
  icon: NETWORK_ICON_MAP.get(network.chainId),
});

type NetworkSelectProps = {
  className?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({ className }) => {
  const [, setChainId] = useAtom(chainIdAtom);
  const { networks, currentNetwork } = useAtomValue(
    useMemo(
      () =>
        waitForAll({
          networks: getAllMainNetworksAtom,
          currentNetwork: getCurrentNetworkAtom,
        }),
      []
    )
  );

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const fuse = useMemo(() => new Fuse(networks, searchOptions), [networks]);

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
