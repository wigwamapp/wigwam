import {
  FC,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import useForceUpdate from "use-force-update";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { mergeRefs } from "react-merge-refs";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { COINGECKO_NATIVE_TOKEN_IDS } from "fixtures/networks";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
  TokenActivity as TokenActivityPrimitive,
  TokenActivityProject,
} from "core/types";
import {
  createTokenActivityKey,
  createTokenSlug,
  parseTokenSlug,
} from "core/common/tokens";
import { findToken } from "core/client";
import * as repo from "core/repo";

import {
  LOAD_MORE_ON_ACTIVITY_FROM_END,
  LOAD_MORE_ON_ASSET_FROM_END,
} from "app/defaults";
import { Page, ReceiveTab as ReceiveTabEnum } from "app/nav";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  OverflowProvider,
  TippySingletonProvider,
  useChainId,
  useIsSyncing,
  useLazyNetwork,
  useTokenActivitiesSync,
  useTokenActivity,
} from "app/hooks";
import { useAccountToken, useAllAccountTokens } from "app/hooks/tokens";
import { LARGE_AMOUNT } from "app/utils/largeAmount";

import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { ReactComponent as CoinGeckoIcon } from "app/icons/coint-gecko.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as ActivitySendIcon } from "app/icons/activity-send.svg";
import { ReactComponent as ActivityReceiveIcon } from "app/icons/activity-receive.svg";
import { ReactComponent as ActivityApproveIcon } from "app/icons/activity-approve.svg";

import AssetsSwitcher from "../elements/AssetsSwitcher";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import Button from "../elements/Button";
import SearchInput from "../elements/SearchInput";
import ControlIcon from "../elements/ControlIcon";
import AssetLogo from "../elements/AssetLogo";
import PrettyAmount from "../elements/PrettyAmount";
import FiatAmount from "../elements/FiatAmount";
import PriceArrow from "../elements/PriceArrow";
import ComingSoon from "../elements/ComingSoon";
import SmallContactCard from "../elements/SmallContactCard";
import PrettyDate from "../elements/PrettyDate";
import Avatar from "../elements/Avatar";

const OverviewContent: FC = () => (
  <div className="flex min-h-0 grow">
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
          address: ethers.utils.getAddress(searchValue!),
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
      } else if (tokens.length > 0) {
        setTokenSlug([tokens[0].tokenSlug, "replace"]);
      }
      setIsNftsSelected(value);
    },
    [setIsNftsSelected, setTokenSlug, tokens]
  );

  return (
    <div
      className={classNames(
        "w-[23.25rem] min-w-[23.25rem] pr-6 mt-6",
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
                  isDecimalsMinified
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
                    {new BigNumber(priceUSDChange).abs().toFixed(2)}%
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

enum TokenStandardValue {
  NATIVE = "Native",
  ERC20 = "ERC-20",
  ERC721 = "ERC-721",
  ERC777 = "ERC-777",
  ERC1155 = "ERC-1155",
}

const AssetInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const chainId = useChainId();
  const currentAccount = useAtomValue(currentAccountAtom);

  useTokenActivitiesSync(chainId, currentAccount.address, tokenSlug);

  const currentNetwork = useLazyNetwork();
  const tokenInfo = useAccountToken(tokenSlug) as AccountAsset | undefined;

  const { standard, address } = useMemo(
    () => parseTokenSlug(tokenSlug),
    [tokenSlug]
  );

  const { copy, copied } = useCopyToClipboard(address);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [tokenSlug]);

  if (!tokenInfo) return null;

  const {
    status,
    name,
    symbol,
    rawBalance,
    decimals,
    priceUSD,
    priceUSDChange,
    balanceUSD,
  } = tokenInfo;

  const coinGeckoId =
    status === TokenStatus.Native
      ? COINGECKO_NATIVE_TOKEN_IDS.get(chainId)
      : address;

  const explorerUrl = currentNetwork?.explorerUrls?.[0];

  return (
    <OverflowProvider>
      {(ref) => (
        <ScrollAreaContainer
          ref={mergeRefs([ref, scrollAreaRef])}
          hiddenScrollbar="horizontal"
          className="ml-6 pr-5 -mr-5 flex flex-col"
          viewPortClassName="pb-20 pt-6 viewportBlock"
          scrollBarClassName="py-0 pt-[18.75rem] pb-20"
          type="scroll"
        >
          <div className="w-[31.5rem]">
            <div className="flex mb-5">
              <AssetLogo
                asset={tokenInfo}
                alt={name}
                className="w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5"
              />
              <div className="flex flex-col justify-between grow min-w-0">
                <div className="flex items-center">
                  <h2
                    className={classNames(
                      "text-2xl font-bold",
                      "mr-4",
                      "truncate"
                    )}
                  >
                    {name}
                  </h2>
                  <TippySingletonProvider>
                    <div className="ml-auto flex items-center">
                      {status !== TokenStatus.Native && (
                        <IconedButton
                          aria-label={
                            copied
                              ? "Copied"
                              : `Copy ${TokenStandardValue[standard]} token address`
                          }
                          Icon={copied ? SuccessIcon : CopyIcon}
                          className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                          iconClassName="!w-[1.125rem]"
                          onClick={copy}
                        />
                      )}
                      {explorerUrl && status !== TokenStatus.Native && (
                        <IconedButton
                          aria-label="View asset in Explorer"
                          Icon={WalletExplorerIcon}
                          className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                          iconClassName="!w-[1.125rem]"
                          href={`${explorerUrl}/address/${address}`}
                        />
                      )}
                      {coinGeckoId && (
                        <IconedButton
                          aria-label="View asset in CoinGecko"
                          Icon={CoinGeckoIcon}
                          className="!w-6 !h-6 min-w-[1.5rem]"
                          iconClassName="!w-[1.125rem]"
                          href={`https://www.coingecko.com/en/coins/${coinGeckoId}`}
                        />
                      )}
                    </div>
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
                      .div(100)}
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
              <Button
                to={{ page: Page.Transfer }}
                merge={["token"]}
                theme="secondary"
                className="grow !py-2"
              >
                <SendIcon className="w-6 h-auto mr-2" />
                Transfer
              </Button>
              <Button
                to={{ page: Page.Swap }}
                theme="secondary"
                className="grow !py-2"
              >
                <SwapIcon className="w-6 h-auto mr-2" />
                Swap
              </Button>
              {status === TokenStatus.Native && (
                <Button
                  to={{
                    page: Page.Receive,
                    receive: ReceiveTabEnum.BuyWithCrypto,
                  }}
                  theme="secondary"
                  className="grow !py-2"
                >
                  <BuyIcon className="w-6 h-auto mr-2" />
                  Buy
                </Button>
              )}
            </div>

            <TokenActivity />

            {/*{status !== TokenStatus.Native && (*/}
            {/*  <div className="mt-6 max-w-[23.25rem]">*/}
            {/*    <AddressField*/}
            {/*      key={address}*/}
            {/*      label="Token address"*/}
            {/*      value={address}*/}
            {/*      readOnly*/}
            {/*      labelActions={standard ? <Tag standard={standard} /> : undefined}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*)}*/}
          </div>
        </ScrollAreaContainer>
      )}
    </OverflowProvider>
  );
};

// type TagProps = { standard: TokenStandard };
//
// const Tag: FC<TagProps> = ({ standard }) =>
//   standard !== TokenStandard.Native ? (
//     <span
//       className={classNames(
//         "px-3",
//         "text-xs font-bold text-brand-inactivelight leading-none",
//         "h-6 box-border border border-brand-main/20",
//         "flex items-center",
//         "rounded-lg",
//         "whitespace-nowrap"
//       )}
//     >
//       {TokenStandardValue[standard]}
//     </span>
//   ) : null;

type PriceChangeProps = {
  priceChange: BigNumber.Value;
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
  const value = new BigNumber(priceChange).abs().toFixed(2);

  if (+value === 0) return <></>;

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
          amount={value}
          isDecimalsMinified={true}
          className="inline-flex items-center"
        />
      ) : (
        <FiatAmount
          prefix={isPositive ? "+" : "-"}
          amount={value}
          isDecimalsMinified={true}
          copiable
          className="text-lg font-semibold"
        />
      )}
      {isPercent ? "%" : ""}
    </span>
  );
};

const TokenActivity: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;
  const currentAccount = useAtomValue(currentAccountAtom);
  const { activity, loadMore, hasMore } = useTokenActivity(
    currentAccount.address,
    tokenSlug
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerAssetRef = useCallback(
    (node) => {
      if (!activity) return;

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
    [activity, hasMore, loadMore]
  );

  if (activity.length === 0) return null;

  return (
    <div className="flex flex-col mt-5 pt-1 border-t border-brand-main/[.07]">
      {/*<h3 className="text-xl font-bold">Token activity</h3>*/}
      {activity.map((activ, i) => (
        <TokenActivityCard
          ref={
            i === activity.length - LOAD_MORE_ON_ACTIVITY_FROM_END - 1
              ? loadMoreTriggerAssetRef
              : null
          }
          key={createTokenActivityKey(activ)}
          activity={activ}
          // className={classNames(i !== activity.length - 1 ? "border-b" : "")}
        />
      ))}
    </div>
  );
};

type TokenActivityCardProps = {
  activity: TokenActivityPrimitive;
  className?: string;
};

const TokenActivityCard = forwardRef<HTMLDivElement, TokenActivityCardProps>(
  ({ activity, className }, ref) => {
    const tokenInfo = useAccountToken(activity.tokenSlug)!;
    const currentNetwork = useLazyNetwork();
    const { copy, copied } = useCopyToClipboard(activity.txHash);

    const explorerUrl = currentNetwork?.explorerUrls?.[0];
    const { Icon, prefix, amountClassName, label, anotherAddressLabel } =
      getActivityInfo(activity);

    return (
      <div
        ref={ref}
        className={classNames(
          "flex items-center",
          "h-[4.875rem]",
          "py-4",
          "border-brand-main/[.07]",
          className
        )}
      >
        <div className="flex items-center w-[47%]">
          <div
            className={classNames(
              "flex items-center justify-center",
              "w-9 h-9 min-w-[2.25rem]",
              "bg-brand-main/5",
              "rounded-full",
              "mr-3"
            )}
          >
            <Icon className="w-5 h-5 opacity-75" />
          </div>
          <div className="flex flex-col items-start">
            {new BigNumber(activity.amount ?? 0).gte(LARGE_AMOUNT) ? (
              <span
                className={classNames("text-base font-bold", amountClassName)}
              >
                ∞ {tokenInfo?.symbol}
              </span>
            ) : (
              <PrettyAmount
                amount={new BigNumber(activity.amount ?? 0).abs()}
                decimals={tokenInfo?.decimals}
                currency={tokenInfo?.symbol}
                prefix={prefix}
                isMinified={true}
                copiable={true}
                className={classNames("text-base font-bold", amountClassName)}
              />
            )}

            <div className="mt-1 text-xs font-medium text-brand-inactivedark">
              {label}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start text-sm">
          <SmallContactCard
            address={activity.anotherAddress}
            extended
            isSmall
            addButton={activity.type !== "approve" && !activity.project}
            className="min-h-[1.5rem] text-brand-lightgray !-my-0"
          />

          <div className="mt-1 text-xs font-medium capitalize text-brand-inactivedark">
            {activity.project ? (
              <ProjectLabel project={activity.project} />
            ) : (
              <span>{anotherAddressLabel}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end ml-auto">
          <div className="flex items-center">
            <IconedButton
              aria-label={copied ? "Copied" : "Copy transaction hash"}
              Icon={copied ? SuccessIcon : CopyIcon}
              className="!w-6 !h-6 min-w-[1.5rem]"
              iconClassName="!w-[1.125rem]"
              onClick={copy}
            />
            {explorerUrl && (
              <IconedButton
                aria-label="View transaction in Explorer"
                Icon={WalletExplorerIcon}
                className="!w-6 !h-6 min-w-[1.5rem] ml-2"
                iconClassName="!w-[1.125rem]"
                href={`${explorerUrl}/tx/${activity.txHash}`}
              />
            )}
          </div>
          <div className="text-xs mt-1 text-brand-inactivedark">
            <PrettyDate date={activity.timeAt} />
            {/*{getPrettyDate(activity.timeAt)}*/}
          </div>
        </div>
      </div>
    );
  }
);

type ProjectLabelProps = {
  project: TokenActivityProject;
  className?: string;
};

const ProjectLabel: FC<ProjectLabelProps> = ({ project, className }) => {
  const children = (
    <>
      {project.logoUrl && (
        <Avatar src={project.logoUrl} className="h-3 w-3 mr-1" />
      )}

      {project.name}
    </>
  );

  return project.siteUrl ? (
    <a
      href={project.siteUrl}
      target="_blank"
      rel="nofollow noreferrer"
      className={classNames("flex items-center hover:underline", className)}
    >
      {children}
    </a>
  ) : (
    <span className={classNames("flex items-center", className)}>
      {children}
    </span>
  );
};

const getActivityInfo = (activity: TokenActivityPrimitive) => {
  if (activity.type === "approve") {
    return {
      Icon: ActivityApproveIcon,
      prefix: null,
      amountClassName: classNames("text-brand-main"),
      label: "Approve",
      anotherAddressLabel: "Operator",
    };
  }

  if (new BigNumber(activity.amount).gte(0)) {
    return {
      Icon: ActivityReceiveIcon,
      prefix: "+",
      amountClassName: classNames("text-[#6BB77A]"),
      label: activity.project ? "Interaction" : "Receive",
      anotherAddressLabel: "Sender",
    };
  }

  return {
    Icon: ActivitySendIcon,
    prefix: "-",
    amountClassName: "",
    label: activity.project ? "Interaction" : "Transfer",
    anotherAddressLabel: "Recipient",
  };
};
