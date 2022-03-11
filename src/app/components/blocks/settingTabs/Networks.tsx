import { FC, useMemo, useState } from "react";
import classNames from "clsx";
import Fuse from "fuse.js";

import { useLazyAllNetworks } from "app/hooks";
import { NETWORK_ICON_MAP } from "fixtures/networks";
import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import SearchInput from "app/components/elements/SearchInput";
import EditNetwork from "app/components/blocks/EditNetwork";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";

type NetworkTab = number | null;
const Networks: FC = () => {
  const allNetworks = useLazyAllNetworks();

  const [tab, setTab] = useState<NetworkTab>(null);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const fuse = useMemo(
    () => new Fuse(allNetworks ?? [], NETWORK_SEARCH_OPTIONS),
    [allNetworks]
  );
  const preparedNetworks = useMemo(() => {
    if (!allNetworks) {
      return;
    }
    if (searchValue) {
      return fuse.search(searchValue).map(({ item: network }) => network);
    } else {
      return allNetworks;
    }
  }, [fuse, allNetworks, searchValue]);

  const cancelEditing = () => setTab(null);
  const currentNetwork = useMemo(
    () => allNetworks?.find((n) => n.chainId === tab),
    [tab, allNetworks]
  );
  return (
    <div className="flex">
      <div
        className={classNames(
          "w-[318px] px-5",
          "border-r border-brand-main/[.07]"
        )}
      >
        <div className={classNames("relative", "px-1")}>
          <SearchInput
            placeholder="Type name to search..."
            searchValue={searchValue}
            toggleSearchValue={(value: string | null) => setSearchValue(value)}
          />
          <nav>
            <NetworkBtn
              id={0}
              name="Add new network"
              tab={tab}
              onClick={() => setTab(0)}
            />
            {preparedNetworks &&
              preparedNetworks.map((network) => (
                <NetworkBtn
                  key={network.chainId}
                  id={network.chainId}
                  name={network.name}
                  icon={NETWORK_ICON_MAP.get(network.chainId)}
                  tab={tab}
                  onClick={() => setTab(network.chainId)}
                />
              ))}
          </nav>
        </div>
      </div>
      {(currentNetwork || tab === 0) && (
        <EditNetwork
          className="px-6 w-[24.875rem]"
          isNew={tab === 0}
          network={currentNetwork}
          onCancelHandler={cancelEditing}
        />
      )}
    </div>
  );
};

interface NetworkBtnProps {
  id: number;
  icon?: string;
  name: string;
  tab: NetworkTab;
  onClick: () => void;
}
const NetworkBtn: FC<NetworkBtnProps> = ({ id, icon, tab, name, onClick }) => {
  return (
    <button
      type="button"
      className={classNames(
        "relative group",
        "inline-flex justify-start",
        "mt-2 px-3",
        "first:mt-5",
        "w-[270px] py-3",
        "text-base font-bold",
        tab !== id && "hover:bg-brand-main/[.1]",
        (tab === id || id === 0) && "bg-brand-main/[.05]",
        "rounded-[10px]"
      )}
      onClick={onClick}
    >
      {icon ? (
        <img src={icon} alt={name} className={"w-6 h-6 mr-3"} />
      ) : (
        <PlusCircleIcon className="mr-3" />
      )}
      {name}
      <div
        className={classNames(
          tab === id && "translate-x-0 opacticy-100",
          tab !== id && "translate-x-[-4px] opacity-0",
          "absolute right-6 inset-y-1/2",
          "transition-transform rotate-[270deg]",
          "group-hover:translate-x-0 group-hover:opacity-100"
        )}
      >
        <ChevronDownIcon />
      </div>
    </button>
  );
};

export default Networks;
