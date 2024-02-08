import { FC, useCallback, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import Fuse from "fuse.js";
import BigNumber from "bignumber.js";
import { useLazyAtomValue } from "lib/atom-utils";

import {
  DEFAULT_NETWORKS,
  DEFAULT_CHAIN_IDS,
  getNetworkIconUrl,
} from "fixtures/networks";
import { Network } from "core/types";
import { isTrackingEnabled, TEvent, trackEvent } from "core/client";

import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { pageAtom, sentAnalyticNetworksAtom } from "app/atoms";
import { Page, SettingTab } from "app/nav";
import { ReactComponent as GearIcon } from "app/icons/gear.svg";
import { ReactComponent as AddIcon } from "app/icons/PlusCircle.svg";

import Select from "./Select";
import IconedButton from "./IconedButton";
import SmartLink from "./SmartLink";
import Button from "./Button";

export const prepareNetwork = (network: Network) => ({
  key: network.chainId,
  value: network.name,
  icon: getNetworkIconUrl(network),
  balanceUSD:
    network.balanceUSD && new BigNumber(network.balanceUSD).isGreaterThan(0)
      ? network.balanceUSD
      : undefined,
});

type NetworkSelectProps = {
  networks: Network[];
  currentItem?: any;
  currentNetwork?: Network;
  onNetworkChange: (chainId: number) => void;
  withAction?: boolean;
  actionType?: "small" | "large";
  size?: "large" | "small";
  source?: string;
  contentAlign?: "center" | "start" | "end";
  className?: string;
  currentItemClassName?: string;
  currentListItemClassName?: string;
  currentItemIconClassName?: string;
  contentClassName?: string;
};

const NetworkSelectPrimitive: FC<NetworkSelectProps> = ({
  networks,
  currentItem,
  currentNetwork,
  onNetworkChange,
  withAction = true,
  actionType = "small",
  size = "large",
  source,
  contentAlign,
  className,
  currentItemClassName,
  currentListItemClassName,
  currentItemIconClassName,
  contentClassName,
}) => {
  const page = useAtomValue(pageAtom);

  const sentAnalyticNetworks = useLazyAtomValue(sentAnalyticNetworksAtom);
  const setSentAnalyticNetworks = useSetAtom(sentAnalyticNetworksAtom);

  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const fuse = useMemo(
    () => new Fuse(networks, NETWORK_SEARCH_OPTIONS),
    [networks],
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
    [currentNetwork],
  );

  const handleLinkClick = useCallback(() => {
    setOpened(false);
  }, []);

  const trackNetworkChanged = useCallback(
    async (chainId: number) => {
      try {
        const enabled = await isTrackingEnabled();
        if (!enabled) return;

        const isAlreadySentNetwork = sentAnalyticNetworks
          ? sentAnalyticNetworks.findIndex((id) => id === chainId) !== -1
          : false;

        if (isAlreadySentNetwork) return;

        const isDefault = DEFAULT_CHAIN_IDS.has(chainId);

        trackEvent(TEvent.NetworkChange, {
          name: isDefault
            ? DEFAULT_NETWORKS.find((el) => el.chainId === chainId)!.name
            : "unknown",
          chainId: isDefault ? chainId : "unknown",
          source: source ?? `page_${page}`,
        });

        setSentAnalyticNetworks((current) => [...current, chainId]);
      } catch (err) {
        console.error(err);
      }
    },
    [source, page, sentAnalyticNetworks, setSentAnalyticNetworks],
  );

  const handleNetworkChange = useCallback(
    (chainId: number) => {
      onNetworkChange(chainId);
      trackNetworkChanged(chainId);
    },
    [onNetworkChange, trackNetworkChanged],
  );

  return (
    <Select
      open={opened}
      onOpenChange={setOpened}
      items={preparedNetworks}
      currentItem={currentItem ?? preparedCurrentNetwork}
      setItem={(network) => handleNetworkChange(network.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      className={className}
      showSelected={true}
      scrollAreaClassName="h-64"
      showSelectedIcon={false}
      contentAlign={contentAlign}
      currentItemClassName={currentItemClassName}
      currentListItemClassName={currentListItemClassName}
      currentItemIconClassName={currentItemIconClassName}
      contentClassName={contentClassName}
      modal={true}
      size={size}
      placeholder="Search Network"
      actions={
        withAction ? (
          actionType === "small" ? (
            <IconedButton
              aria-label="Manage networks"
              to={{ page: Page.Settings, setting: SettingTab.Networks }}
              smartLink
              onClick={handleLinkClick}
              theme="tertiary"
              Icon={GearIcon}
              className="ml-2 bg-[#373B45] !w-11 !h-11 !shrink-0 !rounded-lg"
            />
          ) : (
            <Button
              to={{ page: Page.Settings, setting: SettingTab.Networks }}
              theme="secondary"
              onClick={handleLinkClick}
              className="ml-2 self-stretch !py-0 whitespace-nowrap"
            >
              <AddIcon className="w-5 h-auto min-w-[1.25rem] mr-2" /> Add
              network
            </Button>
          )
        ) : undefined
      }
      actionsClassName="pr-4"
      emptySearchText={
        <div className="max-w-[14rem]">
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
        </div>
      }
    />
  );
};

export default NetworkSelectPrimitive;
