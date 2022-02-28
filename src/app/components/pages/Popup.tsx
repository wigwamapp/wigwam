import { FC, HTMLAttributes, useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import classNames from "clsx";
import Fuse from "fuse.js";

import { ASSETS_SEARCH_OPTIONS } from "app/defaults";
import PopupLayout from "app/components/layouts/PopupLayout";
import NetworkSelect from "app/components/elements/NetworkSelect";
import AccountSelect from "app/components/elements/AccountSelect";
import AssetsSwitcher from "app/components/elements/AssetsSwitcher";
import SearchInput from "app/components/elements/SearchInput";
import IconedButton from "app/components/elements/IconedButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as ConfigIcon } from "app/icons/control.svg";
import { ReactComponent as PopoverIcon } from "app/icons/popover.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity.svg";
import { AssetsTempData, AssetTempType } from "app/temp-data/assets";

const Popup: FC = () => (
  <PopupLayout>
    <NetworkSelect
      className="max-w-auto"
      currentItemClassName="!px-3 !py-1.5"
      currentItemIconClassName="w-8 h-8 !mr-3"
    />
    {/*{isOpenedSelect && (*/}
    {/*  <div*/}
    {/*    className={classNames(*/}
    {/*      "absolute bottom-0 left-0",*/}
    {/*      isOpenedSelect === "network" && "w-screen h-[calc(100vh-7.75rem)]",*/}
    {/*      isOpenedSelect === "assets" && "w-screen h-[calc(100vh-12.25rem)]",*/}
    {/*      "bg-brand-darkblue/60",*/}
    {/*      "z-[6]"*/}
    {/*    )}*/}
    {/*  />*/}
    {/*)}*/}
    <AccountSelect className="mt-2" />
    <AssetsList />
  </PopupLayout>
);

export default Popup;

const AssetsList: FC = () => {
  const [isNftsSelected, setIsNftsSelected] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const fuse = useMemo(
    () => new Fuse(AssetsTempData, ASSETS_SEARCH_OPTIONS),
    []
  );

  const filteredAssets = useMemo(() => {
    if (searchValue) {
      return fuse.search(searchValue).map(({ item: asset }) => asset);
    }
    return AssetsTempData;
  }, [fuse, searchValue]);

  return (
    <>
      <div className="flex items-center mt-5">
        <AssetsSwitcher
          theme="small"
          checked={isNftsSelected}
          onCheckedChange={setIsNftsSelected}
        />
        <SearchInput
          searchValue={searchValue}
          toggleSearchValue={setSearchValue}
          className="ml-2"
          inputClassName="max-h-9 !pl-9 !pr-10"
          placeholder="Type to search..."
          adornmentClassName="!left-3"
          clearButtonClassName="!right-3"
        />
        <IconedButton
          Icon={ConfigIcon}
          theme="tertiary"
          className="ml-2"
          aria-label="Manage assets list"
        />
      </div>
      <ScrollAreaContainer
        className="pr-3.5 -mr-3.5 mt-2"
        viewPortClassName="pb-16 rounded-t-[.625rem]"
        scrollBarClassName="py-0 pb-16"
        hiddenScrollbar="horizontal"
      >
        {filteredAssets.map((asset, i) => (
          <AssetCard
            key={asset.name}
            asset={asset}
            className={classNames(i !== AssetsTempData.length - 1 && "mb-1")}
          />
        ))}
      </ScrollAreaContainer>
    </>
  );
};

type AssetCardProps = {
  asset: Omit<AssetTempType, "type" | "price" | "priceChange">;
  className?: string;
};

const AssetCard: FC<AssetCardProps> = ({ asset, className }) => {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const { icon, name, symbol, balance, dollars } = asset;

  return (
    <span
      // type="button"
      className={classNames(
        "flex items-stretch",
        "w-full p-2",
        "text-left",
        "rounded-[.625rem]",
        "cursor-pointer",
        "group",
        "transition-colors",
        !popoverOpened && "hover:bg-brand-main/10",
        popoverOpened && "bg-brand-main/20",
        className
      )}
    >
      <span
        className={classNames(
          "block",
          "w-11 h-11 min-w-[2.75rem] mr-3",
          "bg-white",
          "rounded-full overflow-hidden"
        )}
      >
        <img src={icon} alt={name} className="w-full h-full object-cover" />
      </span>
      <span className="flex flex-col w-full">
        <span className="text-sm font-bold leading-5">{name}</span>
        <span className="mt-auto flex justify-between items-end">
          <span className="text-sm font-bold leading-5">
            {balance} {symbol}
          </span>
          <span
            className={classNames(
              "ml-2",
              "text-xs leading-4",
              "text-brand-inactivedark",
              "transition-colors",
              "group-hover:text-brand-light"
            )}
          >
            $ {dollars}
          </span>
        </span>
      </span>
      <Popover className="ml-2" onOpenChange={setPopoverOpened} />
    </span>
  );
};

type PopoverProps = PopoverPrimitive.PopoverProps & {
  className?: string;
};

const Popover: FC<PopoverProps> = ({ className, ...rest }) => (
  <PopoverPrimitive.Root {...rest}>
    <PopoverPrimitive.Trigger asChild className={className}>
      <IconedButton Icon={PopoverIcon} theme="tertiary" />
    </PopoverPrimitive.Trigger>
    {/*<PopoverPrimitive.Anchor />*/}
    <PopoverPrimitive.Content
      side="left"
      align="start"
      className={classNames(
        "bg-brand-dark/10",
        "backdrop-blur-[30px]",
        "border border-brand-light/5",
        "rounded-[.625rem]",
        "px-1 py-2"
      )}
    >
      <PopoverButton Icon={SendIcon}>Send</PopoverButton>
      <PopoverButton Icon={SwapIcon}>Swap</PopoverButton>
      <PopoverButton Icon={ActivityIcon}>Activity</PopoverButton>
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Root>
);

type PopoverButton = HTMLAttributes<HTMLButtonElement> & {
  Icon: FC<{ className?: string }>;
};

const PopoverButton: FC<PopoverButton> = ({ Icon, children, ...rest }) => (
  <button
    type="button"
    className={classNames(
      "flex items-center",
      "min-w-[7.5rem] w-full px-2 py-1",
      "rounded-[.625rem]",
      "text-sm font-bold",
      "transition-colors",
      "hover:bg-brand-main/20"
    )}
    {...rest}
  >
    <Icon className="mr-2" />
    {children}
  </button>
);
