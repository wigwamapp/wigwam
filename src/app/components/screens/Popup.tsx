import {
  FC,
  forwardRef,
  HTMLAttributes,
  useCallback,
  memo,
  useRef,
  useState,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { dequal } from "dequal/lite";

import { AccountAsset, TokenStatus, TokenType } from "core/types";
import * as repo from "core/repo";
import { createAccountTokenKey } from "core/common/tokens";

import { LOAD_MORE_ON_ASSET_FROM_END } from "app/defaults";
import { Page } from "app/nav";
import { openInTab } from "app/helpers";
import { currentAccountAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { useAccountTokens } from "app/hooks/tokens";
import PopupLayout from "app/components/layouts/PopupLayout";
import PreloadUnlocked from "app/components/layouts/PreloadUnlocked";
import NetworkSelect from "app/components/elements/NetworkSelect";
import AccountSelect from "app/components/elements/AccountSelect";
import AssetsSwitcher from "app/components/elements/AssetsSwitcher";
import SearchInput from "app/components/elements/SearchInput";
import IconedButton from "app/components/elements/IconedButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import PrettyAmount from "app/components/elements/PrettyAmount";
import Tooltip from "app/components/elements/Tooltip";
import ControlIcon from "app/components/elements/ControlIcon";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as PopoverIcon } from "app/icons/popover.svg";
import { ReactComponent as InfoIcon } from "app/icons/info-round.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";

const Popup: FC = () => (
  <PopupLayout>
    <PreloadUnlocked>
      <NetworkSelect
        className="max-w-auto"
        currentItemClassName="pr-3 pl-3.5 !py-1.5"
        currentItemIconClassName="w-8 h-8 !mr-3.5"
        contentClassName="!min-w-[22.25rem]"
      />
      <AccountSelect className="mt-2" />
      <InteractionWithDapp
        className="mt-2"
        state="connected"
        icon="data:image/png;base64,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"
        name="compound.finance"
      />

      <AssetsList />
    </PreloadUnlocked>
  </PopupLayout>
);

export default Popup;

type InteractionWithDappProps = {
  state?: "default" | "connectible" | "connected";
  icon?: string;
  name?: string;
  className?: string;
};

const InteractionWithDapp: FC<InteractionWithDappProps> = ({
  state = "default",
  icon,
  name,
  className,
}) => {
  if (state === "default" && !icon && !name) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        "flex items-center",
        "w-full",
        "min-h-8 py-1 px-3 pr-2",
        "text-xs leading-none",
        "border border-brand-main/[.07]",
        "rounded-[.625rem]",
        className
      )}
    >
      <span
        className={classNames(
          "block",
          "w-5 h-5 mr-1.5",
          "rounded-full overflow-hidden",
          "border",
          state !== "connected" && "border-[#BCC2DB]",
          state === "connected" && "border-[#4F9A5E]"
        )}
      >
        {icon && (
          <Avatar
            src={icon}
            alt={name ?? "Dapp"}
            className={classNames(
              "w-full h-full object-cover",
              "!border-none",
              state === "connectible" && "opacity-50"
            )}
          />
        )}
      </span>
      {name && (
        <span
          className={classNames(
            state !== "connected" && "text-brand-inactivedark"
          )}
        >
          {name}
        </span>
      )}
      {state !== "default" && (
        <button
          type="button"
          className="leading-[.875rem] px-2 py-1 ml-auto transition-opacity hover:opacity-70"
        >
          {state === "connectible" ? "Connect" : "Disconnect"}
        </button>
      )}
    </div>
  );
};

const AssetsList: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const [isNftsSelected, setIsNftsSelected] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [manageModeEnabled, setManageModeEnabled] = useState(false);

  const { tokens, loadMore, hasMore } = useAccountTokens(
    TokenType.Asset,
    currentAccount.address,
    {
      withDisabled: manageModeEnabled,
      search: searchValue ?? undefined,
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

  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.select();
    }
  }, []);

  return (
    <>
      <div className="flex items-center mt-5">
        <TippySingletonProvider>
          <Tooltip
            content={`Switch to ${isNftsSelected ? "assets" : "NFTs"}`}
            asChild
          >
            <span>
              <AssetsSwitcher
                theme="small"
                checked={isNftsSelected}
                onCheckedChange={setIsNftsSelected}
              />
            </span>
          </Tooltip>
          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
            className="ml-2"
            inputClassName="max-h-9 !pl-9"
            placeholder="Type to search..."
            adornmentClassName="!left-3"
          />
          <IconedButton
            Icon={ControlIcon}
            iconProps={{
              isActive: manageModeEnabled,
            }}
            theme="tertiary"
            className={classNames(
              "ml-2 mr-2",
              manageModeEnabled && "bg-brand-main/30"
            )}
            aria-label={
              manageModeEnabled
                ? "Finish managing assets list"
                : "Manage assets list"
            }
            onClick={() => setManageModeEnabled(!manageModeEnabled)}
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
          className="pr-3.5 -mr-3.5 mt-2"
          viewPortClassName="pb-16 rounded-t-[.625rem]"
          scrollBarClassName="py-0 pb-16"
          hiddenScrollbar="horizontal"
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
              isManageMode={manageModeEnabled}
              className={classNames(i !== tokens.length - 1 && "mb-1")}
            />
          ))}
        </ScrollAreaContainer>
      )}
    </>
  );
};

type AssetCardProps = {
  asset: AccountAsset;
  isManageMode?: boolean;
  className?: string;
};

const AssetCard = memo(
  forwardRef<HTMLButtonElement, AssetCardProps>(
    ({ asset, isManageMode = false, className }, ref) => {
      const currentAccount = useAtomValue(currentAccountAtom);

      const [popoverOpened, setPopoverOpened] = useState(false);
      const {
        logoUrl,
        name,
        symbol,
        rawBalance,
        decimals,
        balanceUSD,
        status,
      } = asset;

      const nativeAsset = status === TokenStatus.Native;
      const disabled = status === TokenStatus.Disabled;

      const openLink = useCallback(
        (page: Page) => {
          openInTab({ page: page, token: asset.tokenSlug });
        },
        [asset.tokenSlug]
      );

      const handleAssetClick = useCallback(async () => {
        if (isManageMode) {
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
          if (!popoverOpened) {
            setPopoverOpened(true);
          }
        }
      }, [asset, currentAccount.address, isManageMode, popoverOpened]);

      const content = (
        <button
          ref={ref}
          type="button"
          onClick={handleAssetClick}
          className={classNames(
            "relative",
            "flex items-stretch",
            "w-full p-2",
            "text-left",
            "rounded-[.625rem]",
            "cursor-default",
            "group",
            "transition",
            isManageMode &&
              "hover:bg-brand-main/10 focus-visible:bg-brand-main/10 !cursor-pointer",
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
          <span className="flex flex-col w-full">
            <span className="text-sm font-bold leading-5">{name}</span>
            <span className="mt-auto flex justify-between items-end">
              <PrettyAmount
                amount={rawBalance ?? 0}
                decimals={decimals}
                currency={symbol}
                className="text-sm font-bold leading-5"
                copiable={!isManageMode}
              />
              {!isManageMode && (
                <PrettyAmount
                  amount={balanceUSD ?? 0}
                  currency="$"
                  className={classNames(
                    "ml-2",
                    "text-xs leading-4",
                    "text-brand-inactivedark",
                    "transition-colors"
                    // "group-hover:text-brand-light group-focus-visible:text-brand-light"
                  )}
                  copiable
                />
              )}
            </span>
          </span>
          {!isManageMode ? (
            <DropdownMenu.Trigger asChild>
              <IconedButton
                Icon={PopoverIcon}
                theme="tertiary"
                className={classNames(
                  "ml-2",
                  popoverOpened && "bg-brand-main/30 shadow-buttonsecondary"
                )}
                tabIndex={-1}
              />
            </DropdownMenu.Trigger>
          ) : !nativeAsset ? (
            <Checkbox.Root
              className={classNames(
                "w-5 h-5 min-w-[1.25rem] mx-2 my-auto",
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
          ) : null}
        </button>
      );

      return (
        <DropdownMenu.Root
          open={popoverOpened}
          onOpenChange={setPopoverOpened}
          modal
        >
          {content}

          {!isManageMode && (
            <DropdownMenu.Content
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
              <PopoverButton
                Icon={InfoIcon}
                onClick={() => openLink(Page.Default)}
              >
                Info
              </PopoverButton>
              <PopoverButton
                Icon={SendIcon}
                onClick={() => openLink(Page.Transfer)}
              >
                Transfer
              </PopoverButton>
              <PopoverButton Icon={SwapIcon}>Swap</PopoverButton>
              <PopoverButton Icon={ActivityIcon}>Activity</PopoverButton>
            </DropdownMenu.Content>
          )}
        </DropdownMenu.Root>
      );
    }
  ),
  dequal
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
      "hover:bg-brand-main/20 focus:bg-brand-main/20"
    )}
    {...rest}
  >
    <Icon className="mr-2" />
    {children}
  </button>
);
