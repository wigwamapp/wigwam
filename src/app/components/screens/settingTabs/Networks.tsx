import { FC, useCallback, useMemo, useState } from "react";
import classNames from "clsx";
import Fuse from "fuse.js";

import { NETWORK_ICON_MAP } from "fixtures/networks";

import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { useLazyAllNetworks } from "app/hooks";
import SearchInput from "app/components/elements/SearchInput";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import EditNetwork from "app/components/blocks/EditNetwork";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";

const Networks: FC = () => {
  const allNetworks = useLazyAllNetworks();

  const [tab, setTab] = useState<"new" | number | null>(null);
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

  const selectedNetwork = useMemo(
    () => allNetworks?.find((n) => n.chainId === tab),
    [tab, allNetworks]
  );

  const cancelEditing = useCallback(() => setTab(null), []);

  return (
    <>
      <div
        className={classNames(
          "flex flex-col",
          "w-[calc(19.875rem+1px)] px-6",
          "border-r border-brand-main/[.07]"
        )}
      >
        <SearchInput
          placeholder="Type name to search..."
          searchValue={searchValue}
          toggleSearchValue={(value: string | null) => setSearchValue(value)}
        />
        <ScrollAreaContainer
          className={classNames("flex flex-col", "pr-5 -mr-5 mt-5")}
          viewPortClassName="pb-20 rounded-t-[.625rem]"
          scrollBarClassName="py-0 pb-20"
        >
          <NetworkBtn
            name="Add new network"
            isActive={tab === "new"}
            onClick={() => setTab("new")}
            className="bg-brand-main/[.05]"
          />
          {preparedNetworks?.map(({ chainId, name }) => (
            <NetworkBtn
              key={chainId}
              icon={NETWORK_ICON_MAP.get(chainId)}
              name={name}
              onClick={() => setTab(chainId)}
              isActive={tab === chainId}
              className="mt-2"
            />
          ))}
        </ScrollAreaContainer>
      </div>
      {(selectedNetwork || tab === "new") && (
        <EditNetwork
          key={selectedNetwork ? selectedNetwork.chainId : "new"}
          isNew={tab === "new"}
          network={selectedNetwork}
          onCancelHandler={cancelEditing}
        />
      )}
    </>
  );
};

export default Networks;

type NetworkBtnProps = {
  icon?: string;
  name: string;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
};

const NetworkBtn: FC<NetworkBtnProps> = ({
  icon,
  name,
  onClick,
  isActive = false,
  className,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        "relative group",
        "inline-flex justify-start items-center",
        "w-full py-2 px-3 min-h-[2.75rem]",
        "text-base font-bold whitespace-nowrap",
        "rounded-[.625rem]",
        "transition-colors",
        !isActive && "hover:bg-brand-main/[.05]",
        isActive && "bg-brand-main/10",
        className
      )}
      onClick={onClick}
    >
      {icon ? (
        <img src={icon} alt={name} className={"w-6 h-6 mr-3"} />
      ) : (
        <PlusCircleIcon className="mr-3" />
      )}
      {name}
      <ChevronRightIcon
        className={classNames(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "transition",
          "group-hover:translate-x-0 group-hover:opacity-100",
          isActive && "translate-x-0 opacity-100",
          !isActive && "-translate-x-1.5 opacity-0"
        )}
      />
    </button>
  );
};
