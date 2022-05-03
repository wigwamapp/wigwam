import {
  FC,
  memo,
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import classNames from "clsx";
import useForceUpdate from "use-force-update";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import * as Checkbox from "@radix-ui/react-checkbox";

import { COINGECKO_NATIVE_TOKEN_IDS } from "fixtures/networks";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import { createTokenSlug, parseTokenSlug } from "core/common/tokens";
import { findToken } from "core/client";
import * as repo from "core/repo";

import { LOAD_MORE_ON_ASSET_FROM_END } from "app/defaults";
import { Page } from "app/nav";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useChainId,
  useIsSyncing,
  useLazyNetwork,
} from "app/hooks";
import { useAllAccountTokens, useAccountToken } from "app/hooks/tokens";

import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { ReactComponent as CoinGeckoIcon } from "app/icons/coint-gecko.svg";

import AssetsSwitcher from "../elements/AssetsSwitcher";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import NewButton from "../elements/NewButton";
import SearchInput from "../elements/SearchInput";
import ControlIcon from "../elements/ControlIcon";
import AssetLogo from "../elements/AssetLogo";
import AddressField from "../elements/AddressField";
import PrettyAmount from "../elements/PrettyAmount";
import FiatAmount from "../elements/FiatAmount";
import PriceArrow from "../elements/PriceArrow";
import ComingSoon from "../elements/ComingSoon";

const OverviewContent: FC = () => (
  <div className="flex mt-6 min-h-0 grow">
    <TokenExplorer />
  </div>
);

export default OverviewContent;

const TokenExplorer: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const [isNftsSelected, setIsNftsSelected] = useState(false);

  return (
    <>
      <AssetsList
        isNftsSelected={isNftsSelected}
        setIsNftsSelected={setIsNftsSelected}
      />
      {tokenSlug && !isNftsSelected && <AssetInfo />}
    </>
  );
};

type AssetsListProps = {
  isNftsSelected: boolean;
  setIsNftsSelected: (value: boolean) => void;
};

const AssetsList: FC<AssetsListProps> = ({
  isNftsSelected,
  setIsNftsSelected,
}) => {
  const chainId = useChainId();
  const currentAccount = useAtomValue(currentAccountAtom);
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [manageModeEnabled, setManageModeEnabled] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const setDefaultTokenRef = useRef(!tokenSlug);

  const handleAccountTokensReset = useCallback(() => {
    scrollAreaRef.current?.scrollTo(0, 0);

    setDefaultTokenRef.current = true;
  }, []);

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
    TokenType.Asset,
    currentAccount.address,
    {
      withDisabled: manageModeEnabled,
      search: searchValue ?? undefined,
      onReset: handleAccountTokensReset,
    }
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerAssetRef = useCallback(
    (node) => {
      if (!tokens) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMore, loadMore, tokens]
  );

  // A little hack to avoid using `manageModeEnabled` dependency
  const manageModeEnabledRef = useRef<boolean>();
  if (manageModeEnabledRef.current !== manageModeEnabled) {
    manageModeEnabledRef.current = manageModeEnabled;
  }

  useEffect(() => {
    if (
      setDefaultTokenRef.current &&
      tokens.length > 0 &&
      !manageModeEnabledRef.current
    ) {
      setTokenSlug([tokens[0].tokenSlug, "replace"]);
      setDefaultTokenRef.current = false;
    }
  }, [setTokenSlug, tokens]);

  const handleAssetSelect = useCallback(
    async (asset: AccountAsset) => {
      if (manageModeEnabled) {
        if (asset.status === TokenStatus.Native) return;

        try {
          await repo.accountTokens.put(
            {
              ...asset,
              status:
                asset.status === TokenStatus.Enabled
                  ? TokenStatus.Disabled
                  : TokenStatus.Enabled,
            },
            [asset.chainId, currentAccount.address, asset.tokenSlug].join("_")
          );
        } catch (e) {
          console.error(e);
        }
      } else {
        setTokenSlug([asset.tokenSlug, "replace"]);
      }
    },
    [currentAccount.address, manageModeEnabled, setTokenSlug]
  );

  const toggleManageMode = useCallback(() => {
    if (!manageModeEnabled) {
      setTokenSlug([RESET]);
    }

    setManageModeEnabled((mode) => !mode);
  }, [manageModeEnabled, setManageModeEnabled, setTokenSlug]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.select();
    }
  }, []);

  const syncing = useIsSyncing();
  const forceUpdate = useForceUpdate();

  const searchValueIsAddress = useMemo(
    () => searchValue && ethers.utils.isAddress(searchValue),
    [searchValue]
  );

  const willSearch = Boolean(searchValueIsAddress && tokens.length === 0);
  const alreadySearchedRef = useRef(false);

  useEffect(() => {
    if (willSearch) {
      let mounted = true;

      let t = setTimeout(() => {
        const tokenSlug = createTokenSlug({
          standard: TokenStandard.ERC20,
          address: searchValue!,
          id: "0",
        });

        findToken(chainId, currentAccount.address, tokenSlug);

        t = setTimeout(() => {
          if (mounted) {
            alreadySearchedRef.current = true;
            forceUpdate();
          }
        }, 500);
      }, 500);

      return () => {
        mounted = false;
        clearTimeout(t);
        alreadySearchedRef.current = false;
      };
    }

    return;
  }, [forceUpdate, willSearch, searchValue, chainId, currentAccount.address]);

  const searching = (willSearch || syncing) && !alreadySearchedRef.current;

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      if (value) {
        setTokenSlug([RESET]);
        setSearchValue(null);
        setManageModeEnabled(false);
      } else {
        setTokenSlug([tokens[0].tokenSlug, "replace"]);
      }
      setIsNftsSelected(value);
    },
    [setIsNftsSelected, setTokenSlug, tokens]
  );

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
        onCheckedChange={toggleNftSwitcher}
        className="mx-auto mb-3"
      />
      <div className="flex items-center">
        <TippySingletonProvider>
          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
            disabled={isNftsSelected}
          />
          <IconedButton
            Icon={ControlIcon}
            iconProps={{
              isActive: manageModeEnabled,
            }}
            theme="tertiary"
            className={classNames(
              "ml-2",
              manageModeEnabled && "bg-brand-main/30"
            )}
            aria-label={
              manageModeEnabled
                ? "Finish managing assets list"
                : "Manage assets list"
            }
            disabled={isNftsSelected}
            onClick={toggleManageMode}
          />
        </TippySingletonProvider>
      </div>
      {isNftsSelected ? (
        <ComingSoon label="NFTs" size="small" />
      ) : tokens.length <= 0 && searchValue ? (
        <button
          type="button"
          className={classNames(
            "flex flex-col items-center",
            "h-full w-full py-9",
            "text-sm text-brand-placeholder text-center"
          )}
          onClick={focusSearchInput}
        >
          <NoResultsFoundIcon
            className={classNames("mb-4", searching && "animate-waving-hand")}
          />

          {searching ? (
            <>Searching...</>
          ) : (
            <>
              Can&apos;t find a token?
              <br />
              Put an address into the search line to find it.
            </>
          )}
        </button>
      ) : (
        <ScrollAreaContainer
          ref={scrollAreaRef}
          hiddenScrollbar="horizontal"
          className="pr-5 -mr-5 mt-4"
          viewPortClassName="pb-20 rounded-t-[.625rem] viewportBlock"
          scrollBarClassName="py-0 pb-20"
        >
          {tokens.map((asset, i) => (
            <AssetCard
              key={asset.tokenSlug}
              ref={
                i === tokens.length - LOAD_MORE_ON_ASSET_FROM_END - 1
                  ? loadMoreTriggerAssetRef
                  : null
              }
              asset={asset as AccountAsset}
              isActive={!manageModeEnabled && tokenSlug === asset.tokenSlug}
              onAssetSelect={handleAssetSelect}
              isManageMode={manageModeEnabled}
              className={classNames(i !== tokens.length - 1 && "mb-2")}
            />
          ))}
        </ScrollAreaContainer>
      )}
    </div>
  );
};

type AssetCardProps = {
  asset: AccountAsset;
  isActive?: boolean;
  onAssetSelect: (asset: AccountAsset) => void;
  isManageMode: boolean;
  className?: string;
};

const AssetCard = memo(
  forwardRef<HTMLButtonElement, AssetCardProps>(
    (
      { asset, isActive = false, onAssetSelect, isManageMode, className },
      ref
    ) => {
      const {
        name,
        symbol,
        rawBalance,
        decimals,
        balanceUSD,
        priceUSDChange,
        status,
      } = asset;
      const nativeAsset = status === TokenStatus.Native;
      const disabled = status === TokenStatus.Disabled;
      const hoverable = isManageMode ? !nativeAsset : !isActive;

      const priceClassName = useMemo(
        () =>
          priceUSDChange && +priceUSDChange > 0
            ? "text-[#6BB77A]"
            : "text-[#EA556A]",
        [priceUSDChange]
      );

      return (
        <button
          ref={ref}
          type="button"
          onClick={() => onAssetSelect(asset)}
          className={classNames(
            "relative",
            "flex items-stretch",
            "w-full p-3",
            "text-left",
            "rounded-[.625rem]",
            "group",
            "transition",
            hoverable && "hover:bg-brand-main/10",
            isActive && "bg-brand-main/20",
            disabled && "opacity-60",
            "hover:opacity-100",
            className
          )}
          disabled={isManageMode && nativeAsset}
        >
          <AssetLogo
            asset={asset}
            alt={symbol}
            className="w-11 h-11 min-w-[2.75rem] mr-3"
          />
          <span className="flex flex-col justify-center w-full min-w-0">
            <span className="flex items-end">
              <span
                className={classNames(
                  "text-base font-bold leading-4 truncate mr-auto pb-1 -mb-1",
                  isManageMode && "mr-14"
                )}
              >
                {name}
              </span>
              {!isManageMode && (
                <FiatAmount
                  amount={balanceUSD}
                  className={"text-base font-bold leading-4 ml-2"}
                  threeDots={false}
                />
              )}
            </span>
            <span className="mt-1.5 flex justify-between items-end">
              <PrettyAmount
                amount={rawBalance}
                decimals={decimals}
                currency={symbol}
                threeDots={false}
                className={classNames(
                  "mr-auto",
                  "text-sm leading-4",
                  !isActive && "text-brand-inactivedark",
                  isActive && "text-brand-light",
                  "group-hover:text-brand-light",
                  "transition-colors",
                  "truncate min-w-0",
                  isManageMode && "mr-14"
                )}
              />
              {!isManageMode && priceUSDChange && +priceUSDChange !== 0 && (
                <span
                  className={classNames(
                    "inline-flex items-center",
                    !isActive && "opacity-75",
                    "group-hover:opacity-100",
                    "transition",
                    "ml-2",
                    priceClassName
                  )}
                >
                  <PriceArrow
                    className={classNames(
                      "w-2 h-2 mr-[0.125rem]",
                      +priceUSDChange < 0 && "transform rotate-180"
                    )}
                  />

                  <span className="text-xs leading-4">
                    {+priceUSDChange > 0 ? priceUSDChange : -priceUSDChange}%
                  </span>
                </span>
              )}
              {isManageMode && !nativeAsset && (
                <Checkbox.Root
                  className={classNames(
                    "absolute top-1/2 right-5 -translate-y-1/2",
                    "w-5 h-5 min-w-[1.25rem]",
                    "bg-brand-main/20",
                    "rounded",
                    "flex items-center justify-center",
                    !disabled && "border border-brand-main"
                  )}
                  checked={!disabled}
                  asChild
                >
                  <span>
                    <Checkbox.Indicator>
                      {!disabled && <CheckIcon />}
                    </Checkbox.Indicator>
                  </span>
                </Checkbox.Root>
              )}
            </span>
          </span>
        </button>
      );
    }
  )
);

const AssetInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;
  const currentNetwork = useLazyNetwork();

  const tokenInfo = useAccountToken(tokenSlug) as AccountAsset;
  const parsedTokenSlug = useMemo(
    () => tokenSlug && parseTokenSlug(tokenSlug),
    [tokenSlug]
  );

  if (!tokenInfo || !parsedTokenSlug) {
    return null;
  }

  const {
    chainId,
    status,
    name,
    symbol,
    rawBalance,
    decimals,
    priceUSD,
    priceUSDChange,
    balanceUSD,
  } = tokenInfo;
  const { standard, address } = parsedTokenSlug;

  const coinGeckoId =
    status === TokenStatus.Native
      ? COINGECKO_NATIVE_TOKEN_IDS.get(chainId)
      : address;

  return (
    <div className="w-[31.5rem] ml-6 pb-20 flex flex-col">
      <div className="flex mb-5">
        <AssetLogo
          asset={tokenInfo}
          alt={name}
          className="w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5"
        />
        <div className="flex flex-col justify-between grow min-w-0">
          <div className="flex items-center">
            <h2
              className={classNames("text-2xl font-bold", "mr-4", "truncate")}
            >
              {name}
            </h2>
            <TippySingletonProvider>
              {currentNetwork?.explorerUrls?.[0] && (
                <IconedButton
                  aria-label="View asset in Explorer"
                  Icon={WalletExplorerIcon}
                  className="!w-6 !h-6 min-w-[1.5rem] ml-auto"
                  iconClassName="!w-[1.125rem]"
                  href={`${currentNetwork.explorerUrls[0]}/address/${
                    status === TokenStatus.Native ? name.toLowerCase() : address
                  }`}
                />
              )}
              {coinGeckoId && (
                <IconedButton
                  aria-label="View asset in CoinGecko"
                  Icon={CoinGeckoIcon}
                  className="!w-6 !h-6 min-w-[1.5rem] ml-2"
                  iconClassName="!w-[1.125rem]"
                  href={`https://www.coingecko.com/en/coins/${coinGeckoId}`}
                />
              )}
            </TippySingletonProvider>
          </div>
          <div className="flex flex-col">
            <span className="text-base text-brand-gray leading-none mb-0.5">
              Price
            </span>
            <span className="flex items-center">
              <FiatAmount
                amount={priceUSD ?? 0}
                copiable
                className="text-lg font-bold leading-6 mr-3"
              />
              {priceUSDChange && (
                <PriceChange priceChange={priceUSDChange} isPercent />
              )}
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-base text-brand-gray leading-none mb-3">
          Balance
        </div>

        <div className="flex items-end">
          <FiatAmount
            amount={balanceUSD ?? 0}
            copiable
            className="text-[1.75rem] font-bold leading-none mr-4"
          />
          {priceUSDChange && (
            <PriceChange
              priceChange={new BigNumber(priceUSDChange)
                .times(balanceUSD)
                .div(100)
                .toFixed(2)}
            />
          )}
        </div>
        <div className="mt-1">
          <PrettyAmount
            amount={rawBalance ?? 0}
            decimals={decimals}
            currency={symbol}
            copiable
            className="text-lg text-brand-inactivelight"
          />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <NewButton
          to={{ page: Page.Transfer }}
          merge={["token"]}
          theme="secondary"
          className="grow !py-2"
        >
          <SendIcon className="w-6 h-auto mr-2" />
          Transfer
        </NewButton>
        <NewButton theme="secondary" className="grow !py-2">
          <SwapIcon className="w-6 h-auto mr-2" />
          Swap
        </NewButton>
        <NewButton theme="secondary" className="grow !py-2">
          <ActivityIcon className="w-6 h-auto mr-2" />
          Activity
        </NewButton>
      </div>

      {status !== TokenStatus.Native && (
        <div className="mt-6 max-w-[23.25rem]">
          <AddressField
            key={address}
            label="Token address"
            value={address}
            readOnly
            labelActions={standard ? <Tag standard={standard} /> : undefined}
          />
        </div>
      )}
    </div>
  );
};

enum TokenStandardValue {
  ERC20 = "ERC-20",
  ERC721 = "ERC-721",
  ERC777 = "ERC-777",
  ERC1155 = "ERC-1155",
}

type TagProps = { standard: TokenStandard };

const Tag: FC<TagProps> = ({ standard }) =>
  standard !== TokenStandard.Native ? (
    <span
      className={classNames(
        "px-3",
        "text-xs font-bold text-brand-inactivelight leading-none",
        "h-6 box-border border border-brand-main/20",
        "flex items-center",
        "rounded-lg",
        "whitespace-nowrap"
      )}
    >
      {TokenStandardValue[standard]}
    </span>
  ) : null;

type PriceChangeProps = {
  priceChange: string;
  isPercent?: boolean;
  className?: string;
};

const PriceChange: FC<PriceChangeProps> = ({
  priceChange,
  isPercent = false,
  className,
}) => {
  const priceChangeNumber = +priceChange;

  if (!priceChangeNumber || priceChangeNumber === 0) {
    return <></>;
  }

  const isPositive = priceChangeNumber > 0;

  return (
    <span
      className={classNames(
        "inline-flex items-center",
        isPercent && "text-sm leading-4",
        "font-bold",
        isPercent && "py-1 px-2",
        "rounded-md",
        isPositive && isPercent && "bg-[#4F9A5E]",
        !isPositive && isPercent && "bg-[#B82D41]",
        isPositive && !isPercent && "text-[#6BB77A]",
        !isPositive && !isPercent && "text-[#EA556A]",
        className
      )}
    >
      {isPercent ? (
        <PrettyAmount
          prefix={
            <PriceArrow
              className={classNames(
                "w-2.5 h-2.5 mr-[0.2rem]",
                !isPositive && "transform rotate-180"
              )}
            />
          }
          amount={Math.abs(priceChangeNumber)}
          className="inline-flex items-center"
        />
      ) : (
        <FiatAmount
          prefix={isPositive ? "+" : "-"}
          amount={Math.abs(priceChangeNumber)}
          copiable
          className="text-lg font-semibold"
        />
      )}
      {isPercent ? "%" : ""}
    </span>
  );
};
