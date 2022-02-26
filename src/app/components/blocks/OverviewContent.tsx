import { FC, useMemo, useState } from "react";
import classNames from "clsx";
import Fuse from "fuse.js";

import { ASSETS_SEARCH_OPTIONS } from "app/defaults";
import AssetsSwitcher from "app/components/elements/AssetsSwitcher";
import Input from "app/components/elements/Input";
import IconedButton from "app/components/elements/IconedButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as ConfigIcon } from "app/icons/control.svg";
import { ReactComponent as SearchIcon } from "app/icons/search-input.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ClockIcon } from "app/icons/clock.svg";
import { ReactComponent as ClearIcon } from "app/icons/close.svg";
import { AssetsTempData, AssetTempType } from "app/temp-data/assets";

const OverviewContent: FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<AssetTempType>(
    AssetsTempData[0]
  );

  return (
    <div className="flex mt-6 min-h-0 grow">
      <AssetsList
        activeAssetName={selectedAsset.name}
        onAssetSelect={setSelectedAsset}
      />
      <AssetInfo asset={selectedAsset} />
    </div>
  );
};

export default OverviewContent;

type AssetsListProps = {
  activeAssetName: string;
  onAssetSelect: (asset: AssetTempType) => void;
};

const AssetsList: FC<AssetsListProps> = ({
  activeAssetName,
  onAssetSelect,
}) => {
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
    <div
      className={classNames(
        "w-[23.25rem] min-w-[23.25rem] pr-6",
        "border-r border-brand-main/[.07]",
        "flex flex-col"
      )}
    >
      <AssetsSwitcher
        checked={isNftsSelected}
        onCheckedChange={setIsNftsSelected}
        className="mx-auto mb-3"
      />
      <div className="flex items-center">
        <div className="relative w-full">
          <Input
            placeholder="Type name or address to search..."
            StartAdornment={SearchIcon}
            value={searchValue ?? ""}
            onChange={(e) => {
              setSearchValue(e.currentTarget.value);
            }}
            className="w-full"
            inputClassName="max-h-10 text-sm pr-11"
          />
          {searchValue && (
            <IconedButton
              theme="tertiary"
              Icon={ClearIcon}
              aria-label="Clear"
              onClick={() => setSearchValue(null)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            />
          )}
        </div>
        <IconedButton
          Icon={ConfigIcon}
          theme="tertiary"
          className="ml-2"
          aria-label="Manage assets list"
        />
      </div>
      <ScrollAreaContainer
        className="pr-5 -mr-5 mt-4"
        viewPortClassName="pb-20 rounded-t-[.625rem]"
        scrollBarClassName="py-0 pb-20"
        type="hover"
      >
        {filteredAssets.map((asset, i) => (
          <AssetCard
            key={asset.name}
            asset={asset}
            isActive={activeAssetName === asset.name}
            onAssetSelect={() => {
              onAssetSelect(asset);
              setSearchValue(null);
            }}
            className={classNames(i !== AssetsTempData.length - 1 && "mb-2")}
          />
        ))}
      </ScrollAreaContainer>
    </div>
  );
};

type AssetCardProps = {
  asset: Omit<AssetTempType, "type" | "price" | "priceChange">;
  isActive?: boolean;
  onAssetSelect: () => void;
  className?: string;
};

const AssetCard: FC<AssetCardProps> = ({
  asset,
  isActive = false,
  onAssetSelect,
  className,
}) => {
  const { icon, name, symbol, balance, dollars } = asset;

  return (
    <button
      type="button"
      onClick={onAssetSelect}
      className={classNames(
        "flex items-stretch",
        "w-full p-3",
        "text-left",
        "rounded-[.625rem]",
        "group",
        "transition-colors",
        !isActive && "hover:bg-brand-main/10",
        isActive && "bg-brand-main/20",
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
        <span className="text-sm font-bold leading-4">{name}</span>
        <span className="mt-auto flex justify-between items-end">
          <span className="text-base font-bold leading-4">
            {balance} {symbol}
          </span>
          <span
            className={classNames(
              "ml-2",
              "text-sm leading-4",
              !isActive && "text-brand-inactivedark",
              isActive && "text-brand-light",
              "transition-colors",
              "group-hover:text-brand-light"
            )}
          >
            $ {dollars}
          </span>
        </span>
      </span>
    </button>
  );
};

type AssetInfoProps = {
  asset: AssetTempType;
};

const AssetInfo: FC<AssetInfoProps> = ({ asset }) => {
  const { icon, name, symbol, type, price, priceChange, balance, dollars } =
    asset;

  return (
    <div className="w-[31.5rem] ml-6 pb-20 flex flex-col">
      <div className="flex mb-4">
        <div
          className={classNames(
            "w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5",
            "bg-white",
            "rounded-full overflow-hidden"
          )}
        >
          <img src={icon} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-between grow">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-3">{name}</h2>
            {type && <Tag type={type} />}
            <IconedButton
              aria-label="View wallet transactions in explorer"
              Icon={WalletExplorerIcon}
              className="!w-6 !h-6 ml-auto"
              iconClassName="!w-[1.125rem]"
            />
            <IconedButton
              aria-label="View wallet transactions in explorer"
              Icon={ClockIcon}
              className="!w-6 !h-6 ml-2"
              iconClassName="!w-[1.125rem]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base text-brand-gray leading-none mb-0.5">
              Price
            </span>
            <span className="flex items-center">
              <span className="text-lg font-bold leading-6 mr-3">
                $ {price}
              </span>
              <PriceChange priceChange={priceChange} isPercent />
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-base text-brand-gray leading-none mb-3">
          Balance
        </div>
        <div>
          <span className="text-[1.75rem] font-bold leading-none">
            {balance} {symbol}
          </span>
          <span className="text-base text-brand-inactivedark ml-8 mr-4">
            $ {dollars}
          </span>
          <PriceChange priceChange={"-2.8"} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <NewButton theme="secondary" className="grow !py-2">
          <SendIcon className="mr-2" />
          Send
        </NewButton>
        <NewButton theme="secondary" className="grow !py-2">
          <SwapIcon className="mr-2" />
          Swap
        </NewButton>
        <NewButton theme="secondary" className="grow !py-2">
          <ActivityIcon className="mr-2" />
          Activity
        </NewButton>
      </div>
    </div>
  );
};

type TagProps = Pick<AssetTempType, "type">;

const Tag: FC<TagProps> = ({ type }) => (
  <span
    className={classNames(
      "py-2 px-4",
      "text-base font-bold leading-none",
      "border border-brand-main/20",
      "rounded-[.625rem]"
    )}
  >
    {type === "erc-20" && "ERC-20"}
  </span>
);

type PriceChangeProps = Pick<AssetTempType, "priceChange"> & {
  isPercent?: boolean;
};

const PriceChange: FC<PriceChangeProps> = ({
  priceChange,
  isPercent = false,
}) => {
  const priceChangeNumber = +priceChange;

  if (!priceChangeNumber || priceChangeNumber === 0) {
    return <></>;
  }

  const isPositive = priceChangeNumber > 0;

  return (
    <span
      className={classNames(
        isPercent && "text-sm leading-4",
        !isPercent && "text-base",
        "font-bold",
        isPercent && "py-1 px-2",
        "rounded-md",
        isPositive && isPercent && "bg-[#4F9A5E]",
        !isPositive && isPercent && "bg-[#B82D41]",
        isPositive && !isPercent && "text-[#6BB77A]",
        !isPositive && !isPercent && "text-[#EA556A]"
      )}
    >
      {isPositive ? "+" : "-"}
      {!isPercent ? "$" : ""}
      {Math.abs(priceChangeNumber)}
      {isPercent ? "%" : ""}
    </span>
  );
};
