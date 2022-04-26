import { FC, useMemo, useState } from "react";
import Fuse from "fuse.js";

import { Network } from "core/types";
import { getNetworkIconUrl } from "fixtures/networks";

import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { Page, SettingTab } from "app/nav";
import Select from "./Select";
import IconedButton from "./IconedButton";
import { ReactComponent as GearIcon } from "app/icons/gear.svg";

export const prepareNetwork = (network: Network) => ({
  key: network.chainId,
  value: network.name,
  icon: getNetworkIconUrl(network.chainId),
});

type NetworkSelectProps = {
  networks: Network[];
  currentNetwork: Network;
  onNetworkChange: (chainId: number) => void;
  className?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
  contentClassName?: string;
};

const NetworkSelectPrimitive: FC<NetworkSelectProps> = ({
  networks,
  currentNetwork,
  onNetworkChange,
  className,
  currentItemClassName,
  currentItemIconClassName,
  contentClassName,
}) => {
  const [opened, setOpened] = useState(false);
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
      open={opened}
      onOpenChange={setOpened}
      items={preparedNetworks}
      currentItem={preparedCurrentNetwork}
      setItem={(network) => onNetworkChange(network.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      className={className}
      scrollAreaClassName="h-64"
      currentItemClassName={currentItemClassName}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
      modal={true}
      actions={
        <IconedButton
          aria-label="Manage networks"
          to={{ page: Page.Settings, setting: SettingTab.Networks }}
          onClick={() => setOpened(false)}
          theme="tertiary"
          Icon={GearIcon}
          className="ml-2"
        />
      }
    />
  );
};

export default NetworkSelectPrimitive;
