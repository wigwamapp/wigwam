import { FC, useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import Fuse from "fuse.js";

import {
  DEFAULT_NETWORKS,
  DEFAULT_NETWORKS_CHAIN_IDS_SET,
  getNetworkIconUrl,
} from "fixtures/networks";
import { Network } from "core/types";
import { TEvent, trackEvent } from "core/client";

import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { sentAnalyticNetworksAtom } from "app/atoms";
import { Page, SettingTab } from "app/nav";
import Select from "./Select";
import IconedButton from "./IconedButton";
import SmartLink from "./SmartLink";
import { ReactComponent as GearIcon } from "app/icons/gear.svg";

export const prepareNetwork = (network: Network) => ({
  key: network.chainId,
  value: network.name,
  icon: getNetworkIconUrl(network.chainId),
});

type NetworkSelectProps = {
  networks: Network[];
  currentNetwork?: Network;
  onNetworkChange: (chainId: number) => void;
  withAction?: boolean;
  size?: "large" | "small";
  className?: string;
  currentItemClassName?: string;
  currentItemIconClassName?: string;
  contentClassName?: string;
};

const NetworkSelectPrimitive: FC<NetworkSelectProps> = ({
  networks,
  currentNetwork,
  onNetworkChange,
  withAction = true,
  size = "large",
  className,
  currentItemClassName,
  currentItemIconClassName,
  contentClassName,
}) => {
  const [sentAnalyticNetworks, setSentAnalyticNetworks] = useAtom(
    sentAnalyticNetworksAtom
  );

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
    () => (currentNetwork ? prepareNetwork(currentNetwork) : undefined),
    [currentNetwork]
  );

  const handleLinkClick = useCallback(() => {
    setOpened(false);
  }, []);

  const handleNetworkChange = useCallback(
    (chainId: number) => {
      const isAlreadySentSelectedNetwork = sentAnalyticNetworks
        ? sentAnalyticNetworks.findIndex((el: number) => el === chainId) !== -1
        : false;

      if (!isAlreadySentSelectedNetwork) {
        const isDefault = DEFAULT_NETWORKS_CHAIN_IDS_SET.has(chainId);

        trackEvent(TEvent.NetworkChange, {
          name: isDefault
            ? DEFAULT_NETWORKS.find((el) => el.chainId === chainId)!.name
            : "unknown",
          chainId: isDefault ? chainId : "unknown", // TODO: Add source
        });

        const finalArr = [chainId];
        if (sentAnalyticNetworks) {
          finalArr.push(...sentAnalyticNetworks);
        }
        setSentAnalyticNetworks(finalArr);
      }

      onNetworkChange(chainId);
    },
    [onNetworkChange, sentAnalyticNetworks, setSentAnalyticNetworks]
  );

  return (
    <Select
      open={opened}
      onOpenChange={setOpened}
      items={preparedNetworks}
      currentItem={preparedCurrentNetwork}
      setItem={(network) => handleNetworkChange(network.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      className={className}
      scrollAreaClassName="h-64"
      currentItemClassName={currentItemClassName}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
      modal={true}
      size={size}
      actions={
        withAction ? (
          <IconedButton
            aria-label="Manage networks"
            to={{ page: Page.Settings, setting: SettingTab.Networks }}
            smartLink
            onClick={handleLinkClick}
            theme="tertiary"
            Icon={GearIcon}
            className="ml-2"
          />
        ) : undefined
      }
      emptySearchText={
        <>
          You can add a new network in the{" "}
          {withAction ? (
            <SmartLink
              to={{ page: Page.Settings, setting: SettingTab.Networks }}
              onClick={handleLinkClick}
              className="underline underline-offset-2"
            >
              Settings &gt; Networks
            </SmartLink>
          ) : (
            "Settings > Networks"
          )}{" "}
          tab.
        </>
      }
    />
  );
};

export default NetworkSelectPrimitive;
