import { FC, useCallback, useMemo, useRef, useState } from "react";
import classNames from "clsx";
import Fuse from "fuse.js";
import { useAtomValue } from "jotai";

import { getNetworkIconUrl } from "fixtures/networks";

import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { useLazyAllNetworks } from "app/hooks";
import { chainIdUrlAtom } from "app/atoms";
import { ToastOverflowProvider } from "app/hooks/toast";
import SearchInput from "app/components/elements/SearchInput";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import EditNetwork from "app/components/blocks/EditNetwork";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";

const Networks: FC = () => {
  const allNetworks = useLazyAllNetworks();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const chainIdUrl = useAtomValue(chainIdUrlAtom);

  const [tab, setTab] = useState<"new" | number | null>(chainIdUrl);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const fuse = useMemo(
    () => new Fuse(allNetworks ?? [], NETWORK_SEARCH_OPTIONS),
    [allNetworks],
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
    [tab, allNetworks],
  );

  const cancelEditing = useCallback(() => setTab(null), []);

  const handleScrollList = useCallback(
    (toTop = false) => {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          behavior: "smooth",
          top: toTop ? 0 : scrollAreaRef.current?.scrollHeight,
          left: 0,
        });
      }, 300);
    },
    [scrollAreaRef],
  );

  return (
    <div className="pt-5 flex grow">
      <div
        className={classNames(
          "flex flex-col",
          "w-[calc(19.875rem+1px)] px-6",
          "border-r border-brand-main/[.07]",
        )}
      >
        <SearchInput
          placeholder="Type name to search..."
          searchValue={searchValue}
          toggleSearchValue={(value: string | null) => setSearchValue(value)}
        />
        <ScrollAreaContainer
          ref={scrollAreaRef}
          className={classNames("pr-5 -mr-5 mt-5")}
          viewPortClassName="pb-5 rounded-t-[.625rem] viewportBlock"
          scrollBarClassName="py-0 pb-5"
        >
          <NetworkBtn
            name="Add new network"
            isActive={tab === "new"}
            onClick={() => setTab("new")}
            isCreateNew
            className="bg-brand-main/[.05]"
          />
          {preparedNetworks?.map((net) => (
            <NetworkBtn
              key={net.chainId}
              icon={getNetworkIconUrl(net)}
              name={net.name}
              onClick={() => setTab(net.chainId)}
              isActive={tab === net.chainId}
              className="mt-2"
            />
          ))}
        </ScrollAreaContainer>
      </div>
      {selectedNetwork || tab === "new" ? (
        <EditNetwork
          key={selectedNetwork ? selectedNetwork.chainId : "new"}
          isNew={tab === "new"}
          network={selectedNetwork}
          onCancelHandler={cancelEditing}
          onActionFinished={handleScrollList}
        />
      ) : (
        <section className={classNames("flex flex-col grow relative")}>
          <ToastOverflowProvider isCorner />
        </section>
      )}
    </div>
  );
};

export default Networks;

type NetworkBtnProps = {
  icon?: string;
  name: string;
  onClick: () => void;
  isActive?: boolean;
  isCreateNew?: boolean;
  className?: string;
};

const NetworkBtn: FC<NetworkBtnProps> = ({
  icon,
  name,
  onClick,
  isActive = false,
  isCreateNew = false,
  className,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        "relative group",
        "inline-flex justify-start items-center",
        "w-full py-2 pl-3 pr-9 min-h-[2.75rem]",
        "text-base font-bold whitespace-nowrap",
        "rounded-[.625rem]",
        "transition-colors",
        !isActive && "hover:bg-brand-main/[.05]",
        isActive && "bg-brand-main/10",
        className,
      )}
      onClick={onClick}
    >
      {isCreateNew ? (
        <PlusCircleIcon className="w-[1.625rem] h-auto mr-3" />
      ) : (
        <img src={icon} alt={name} className={"w-6 h-6 mr-3"} />
      )}
      <span className="min-w-0 truncate">{name}</span>
      <ChevronRightIcon
        className={classNames(
          "w-6 h-auto",
          "absolute right-2 top-1/2 -translate-y-1/2",
          "transition",
          "group-hover:translate-x-0 group-hover:opacity-100",
          isActive && "translate-x-0 opacity-100",
          !isActive && "-translate-x-1.5 opacity-0",
        )}
      />
    </button>
  );
};
