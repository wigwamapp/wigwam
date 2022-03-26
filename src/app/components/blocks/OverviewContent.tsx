import {
  FC,
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import classNames from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import * as repo from "core/repo";
import * as Checkbox from "@radix-ui/react-checkbox";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
} from "core/types";
import { createAccountTokenKey, parseTokenSlug } from "core/common/tokens";

import { LOAD_MORE_ON_ASSET_FROM_END } from "app/defaults";
import { Page } from "app/nav";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { useAccountTokens, useToken } from "app/hooks/tokens";
import AssetsSwitcher from "app/components/elements/AssetsSwitcher";
import IconedButton from "app/components/elements/IconedButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import NewButton from "app/components/elements/NewButton";
import SearchInput from "app/components/elements/SearchInput";
import PrettyAmount from "app/components/elements/PrettyAmount";
import ControlIcon from "app/components/elements/ControlIcon";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ClockIcon } from "app/icons/clock.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";

const OverviewContent: FC = () => (
  <div className="flex mt-6 min-h-0 grow">
    <AssetsList />
    <AssetInfo />
  </div>
);

export default OverviewContent;

const AssetsList: FC = () => {
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const [isNftsSelected, setIsNftsSelected] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [manageModeEnabled, setManageModeEnabled] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const setDefaultTokenRef = useRef(!tokenSlug);

  const handleAccountTokensReset = useCallback(() => {
    scrollAreaRef.current?.scrollTo(0, 0);

    setDefaultTokenRef.current = true;
  }, []);

  const { tokens, loadMore, hasMore } = useAccountTokens(
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

  const handleAssetClick = useCallback(
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
        <TippySingletonProvider>
          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
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
            onClick={toggleManageMode}
          />
        </TippySingletonProvider>
      </div>
      {tokens.length <= 0 && searchValue ? (
        <button
          type="button"
          className={classNames(
            "flex flex-col items-center",
            "h-full w-full py-9",
            "text-sm text-brand-placeholder text-center"
          )}
          onClick={focusSearchInput}
        >
          <NoResultsFoundIcon className="mb-4" />
          Can&apos;t find a token?
          <br />
          Put an address into the search line to find it.
        </button>
      ) : (
        <ScrollAreaContainer
          ref={scrollAreaRef}
          viewportAsChild
          className="pr-5 -mr-5 mt-4"
          viewPortClassName="pb-20 rounded-t-[.625rem] !flex flex-col"
          scrollBarClassName="py-0 pb-20"
        >
          {tokens.map((asset, i) => (
            <AssetCard
              key={createAccountTokenKey(asset)}
              ref={
                i === tokens.length - LOAD_MORE_ON_ASSET_FROM_END - 1
                  ? loadMoreTriggerAssetRef
                  : null
              }
              asset={asset as AccountAsset}
              isActive={!manageModeEnabled && tokenSlug === asset.tokenSlug}
              onAssetSelect={() => handleAssetClick(asset as AccountAsset)}
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
  onAssetSelect: () => void;
  isManageMode: boolean;
  className?: string;
};

const AssetCard = forwardRef<HTMLButtonElement, AssetCardProps>(
  (
    { asset, isActive = false, onAssetSelect, isManageMode, className },
    ref
  ) => {
    const { logoUrl, name, symbol, rawBalance, decimals, balanceUSD, status } =
      asset;
    const nativeAsset = status === TokenStatus.Native;
    const disabled = status === TokenStatus.Disabled;
    const hoverable = isManageMode ? !nativeAsset : !isActive;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onAssetSelect}
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
        <Avatar
          src={logoUrl}
          alt={name}
          className="w-11 h-11 min-w-[2.75rem] mr-3"
        />
        <span className="flex flex-col w-full min-w-0">
          <span className="text-sm font-bold leading-4 truncate">{name}</span>
          <span className="mt-auto flex justify-between items-end">
            <PrettyAmount
              amount={rawBalance ?? 0}
              decimals={decimals}
              currency={symbol}
              className={"text-base font-bold leading-4"}
            />
            {!isManageMode && (
              <PrettyAmount
                amount={balanceUSD ?? 0}
                currency="$"
                className={classNames(
                  "ml-2",
                  "text-sm leading-4",
                  !isActive && "text-brand-inactivedark",
                  isActive && "text-brand-light",
                  "group-hover:text-brand-light"
                )}
              />
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
);

const AssetInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const tokenInfo = useToken(tokenSlug) as AccountAsset;
  const parsedTokenSlug = useMemo(
    () => tokenSlug && parseTokenSlug(tokenSlug),
    [tokenSlug]
  );

  if (!tokenInfo || !parsedTokenSlug) {
    return <></>;
  }

  const { logoUrl, name, symbol, rawBalance, decimals, priceUSD, balanceUSD } =
    tokenInfo;
  const { standard } = parsedTokenSlug;

  return (
    <div className="w-[31.5rem] ml-6 pb-20 flex flex-col">
      <div className="flex mb-4">
        <Avatar
          src={logoUrl}
          alt={name}
          className="w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5"
        />
        <div className="flex flex-col justify-between grow min-w-0">
          <div className="flex items-center">
            <h2
              className={classNames("text-2xl font-bold", "mr-3", "truncate")}
            >
              {name}
            </h2>
            {standard && <Tag standard={standard} />}
            <TippySingletonProvider>
              <IconedButton
                aria-label="View wallet transactions in explorer"
                Icon={WalletExplorerIcon}
                className="!w-6 !h-6 min-w-[1.5rem] ml-auto"
                iconClassName="!w-[1.125rem]"
              />
              <IconedButton
                aria-label="View wallet transactions in explorer"
                Icon={ClockIcon}
                className="!w-6 !h-6 min-w-[1.5rem] ml-2"
                iconClassName="!w-[1.125rem]"
              />
            </TippySingletonProvider>
          </div>
          <div className="flex flex-col">
            <span className="text-base text-brand-gray leading-none mb-0.5">
              Price
            </span>
            <span className="flex items-center">
              <PrettyAmount
                amount={priceUSD ?? 0}
                currency="$"
                copiable
                className="text-lg font-bold leading-6 mr-3"
              />
              <PriceChange priceChange="2.8" isPercent />
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-base text-brand-gray leading-none mb-3">
          Balance
        </div>
        <div>
          <PrettyAmount
            amount={rawBalance ?? 0}
            decimals={decimals}
            currency={symbol}
            copiable
            className="text-[1.75rem] font-bold leading-none"
          />

          <PrettyAmount
            amount={balanceUSD ?? 0}
            currency="$"
            copiable
            className="text-base text-brand-inactivedark ml-8 mr-4"
          />

          <PriceChange priceChange={"-2.8"} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <NewButton
          theme="secondary"
          className="grow !py-2"
          to={{ page: Page.Transfer }}
          merge={["token"]}
        >
          <SendIcon className="mr-2" />
          Transfer
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
        "py-2 px-4 mr-4",
        "text-base font-bold leading-none",
        "border border-brand-main/20",
        "rounded-[.625rem]",
        "whitespace-nowrap"
      )}
    >
      {TokenStandardValue[standard]}
    </span>
  ) : null;

type PriceChangeProps = {
  priceChange: string;
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
