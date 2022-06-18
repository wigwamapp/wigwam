import {
  FC,
  forwardRef,
  HTMLAttributes,
  useCallback,
  memo,
  useRef,
  useState,
  useMemo,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";
import { dequal } from "dequal/lite";
import BigNumber from "bignumber.js";

import {
  AccountAsset,
  AccountSource,
  TokenStatus,
  TokenType,
} from "core/types";
import * as repo from "core/repo";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { LOAD_MORE_ON_ASSET_FROM_END } from "app/defaults";
import { Page, ReceiveTab as ReceiveTabEnum } from "app/nav";
import { openInTab } from "app/helpers";
import {
  activeTabAtom,
  activeTabOriginAtom,
  chainIdAtom,
  currentAccountAtom,
  getPermissionAtom,
} from "app/atoms";
import { TippySingletonProvider, useIsSyncing } from "app/hooks";
import { useAllAccountTokens } from "app/hooks/tokens";

import { ReactComponent as PopoverIcon } from "app/icons/popover.svg";
import { ReactComponent as InfoRoundIcon } from "app/icons/info-round.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";

import PopupLayout from "../layouts/PopupLayout";
import PreloadBaseAndSync from "../layouts/PreloadBaseAndSync";
import NetworkSelect from "../elements/NetworkSelect";
import AccountSelect from "../elements/AccountSelect";
import AssetsSwitcher from "../elements/AssetsSwitcher";
import SearchInput from "../elements/SearchInput";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import FiatAmount from "../elements/FiatAmount";
import Tooltip from "../elements/Tooltip";
import ControlIcon from "../elements/ControlIcon";
import Avatar from "../elements/Avatar";
import AssetLogo from "../elements/AssetLogo";
import PrettyAmount from "../elements/PrettyAmount";
import PriceArrow from "../elements/PriceArrow";
import ComingSoon from "../elements/ComingSoon";
import TooltipIcon from "../elements/TooltipIcon";

const Popup: FC = () => (
  <PreloadAndSync>
    <PopupLayout>
      <PopupNetworkSelect />

      <AccountSelect className="mt-2" />

      <InteractionWithDapp className="mt-2" />

      <AssetsList />
    </PopupLayout>
  </PreloadAndSync>
);

export default Popup;

const PreloadAndSync: FC = ({ children }) => {
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const permission = useAtomValue(getPermissionAtom(tabOrigin));

  return (
    <PreloadBaseAndSync chainId={permission?.chainId}>
      {children}
    </PreloadBaseAndSync>
  );
};

const PopupNetworkSelect: FC = () => {
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const isSyncing = useIsSyncing();

  const handleChange = useCallback(
    (chainId: number) => {
      if (!tabOrigin) return;

      repo.permissions
        .where({ origin: tabOrigin })
        .modify((perm) => {
          perm.chainId = chainId;
        })
        .catch(console.error);
    },
    [tabOrigin]
  );

  return (
    <NetworkSelect
      className="max-w-auto"
      currentItemClassName="!h-11 pr-3 !pl-3 !py-1.5"
      currentItemIconClassName={classNames(
        "!w-8 !h-8 !mr-3",
        isSyncing && "animate-pulse"
      )}
      contentClassName="w-[22.25rem]"
      onChange={handleChange}
    />
  );
};

const InteractionWithDapp: FC<{ className?: string }> = ({ className }) => {
  const activeTab = useAtomValue(activeTabAtom);
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const permission = useAtomValue(getPermissionAtom(tabOrigin));
  const currentAccount = useAtomValue(currentAccountAtom);

  const accountConnected = useMemo(
    () =>
      permission
        ? permission.accountAddresses.includes(currentAccount.address)
        : false,
    [permission, currentAccount]
  );

  const watchOnlyAcc = currentAccount.source === AccountSource.Address;

  const reallyConnectible = useMemo(() => {
    if (!activeTab?.url) return false;

    const { protocol, pathname } = new URL(activeTab.url);

    for (const type of [/\.xml$/u, /\.pdf$/u]) {
      if (type.test(pathname)) {
        return false;
      }
    }

    return protocol.startsWith("http") || protocol.startsWith("file");
  }, [activeTab]);

  const state = useMemo(() => {
    if (!permission) return "disconnected";
    if (accountConnected) return "connected";
    return "connectible";
  }, [permission, accountConnected]);

  const handlePermission = useCallback(async () => {
    if (!permission) return;

    try {
      if (accountConnected) {
        await repo.permissions.delete(permission.origin);
      } else {
        await repo.permissions
          .where({ origin: permission.origin })
          .modify((perm) => {
            perm.accountAddresses.push(currentAccount.address);
          });
      }
    } catch (err) {
      console.error(err);
    }
  }, [permission, accountConnected, currentAccount]);

  if (!reallyConnectible) return null;

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
      {permission ? (
        state === "connected" ? (
          <span
            className={classNames(
              "block",
              "w-5 h-5 mr-1.5",
              "rounded-full overflow-hidden",
              "border border-[#4F9A5E]"
            )}
          >
            <Avatar
              src={activeTab?.favIconUrl}
              alt={permission.origin}
              className={classNames(
                "w-full h-full object-cover",
                "!border-none"
              )}
            />
          </span>
        ) : (
          <Tooltip
            content={
              <p>
                Current wallet is not connected to this website.
                {!watchOnlyAcc &&
                  " To connect it - click Connect on the right."}
                <br />
                If you want to disconnect all wallets - switch to any connected
                wallet, and then click Disconnect on the right.
              </p>
            }
            placement="bottom-end"
            size="large"
            interactive={false}
          >
            <span
              className={classNames(
                "block relative",
                "w-5 h-5 mr-1.5",
                "rounded-full overflow-hidden",
                "border border-[#BCC2DB]/[0.7]"
              )}
            >
              <Avatar
                src={activeTab?.favIconUrl}
                alt={permission.origin}
                className={classNames(
                  "w-full h-full object-cover",
                  "!border-none opacity-25"
                )}
              />

              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-0 left-0 w-4.5 h-4.5"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 11V8.99L11.02 8.991L11.01 13H12.02V15H9.00001V11H8ZM9.00001 7.019V5H11.02V7.019H9.00001Z"
                  fill="#F8F9FD"
                />
              </svg>
            </span>
          </Tooltip>
        )
      ) : (
        <Tooltip
          content={
            <p>
              Vigvam is not connected to this site. To connect to a web3 site,
              find and click the Connect button.
            </p>
          }
          placement="bottom-end"
          size="large"
          interactive={false}
        >
          <TooltipIcon
            theme="dark"
            className="w-5 h-5 mr-1.5 border border-brand-main/[.07]"
          />
        </Tooltip>
      )}
      {tabOrigin && (
        <span
          className={classNames(
            state !== "connected" && "text-brand-inactivedark"
          )}
        >
          {new URL(tabOrigin).host}
        </span>
      )}
      {permission && !watchOnlyAcc && (
        <button
          type="button"
          className="leading-[.875rem] px-2 py-1 -my-1 ml-auto transition-opacity hover:opacity-70"
          onClick={handlePermission}
        >
          {accountConnected ? "Disconnect" : "Connect"}
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

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
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

  const toggleNftSwitcher = useCallback((value: boolean) => {
    if (value) {
      setSearchValue(null);
      setManageModeEnabled(false);
    }
    setIsNftsSelected(value);
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
                onCheckedChange={toggleNftSwitcher}
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
            disabled={isNftsSelected}
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
            disabled={isNftsSelected}
            onClick={() => setManageModeEnabled(!manageModeEnabled)}
          />
        </TippySingletonProvider>
      </div>
      {isNftsSelected ? (
        <ComingSoon label="NFTs" size="extra-small" />
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
          <NoResultsFoundIcon className="mb-4" />
          Can&apos;t find a token?
          <br />
          Put an address into the search line to find it.
        </button>
      ) : (
        <ScrollAreaContainer
          hiddenScrollbar="horizontal"
          className="pr-3.5 -mr-3.5 mt-2"
          viewPortClassName="pb-16 rounded-t-[.625rem] viewportBlock"
          scrollBarClassName="py-0 pb-16"
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
      const setInternalChainId = useSetAtom(chainIdAtom);

      const [popoverOpened, setPopoverOpened] = useState(false);
      const {
        chainId,
        name,
        symbol,
        rawBalance,
        decimals,
        balanceUSD,
        status,
        priceUSDChange,
      } = asset;

      const nativeAsset = status === TokenStatus.Native;
      const disabled = status === TokenStatus.Disabled;

      const openLink = useCallback(
        (to: Record<string, unknown>) => {
          setInternalChainId(chainId);
          openInTab(to);
        },
        [setInternalChainId, chainId]
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
        }
      }, [asset, currentAccount.address, isManageMode]);

      const handleAssetContextMenu = useCallback(
        async (e) => {
          if (!isManageMode) {
            e.preventDefault();
            if (!popoverOpened) {
              setPopoverOpened(true);
            }
          }
        },
        [isManageMode, popoverOpened]
      );

      const priceClassName = useMemo(
        () =>
          priceUSDChange && +priceUSDChange > 0
            ? "text-[#6BB77A]"
            : "text-[#EA556A]",
        [priceUSDChange]
      );

      const content = (
        <button
          ref={ref}
          type="button"
          onClick={handleAssetClick}
          onContextMenu={handleAssetContextMenu}
          className={classNames(
            "relative",
            "flex items-stretch",
            "w-full p-2",
            "text-left",
            "rounded-[.625rem]",
            "cursor-default",
            "group",
            "transition",
            popoverOpened && "bg-brand-main/10",
            isManageMode &&
              "hover:bg-brand-main/10 focus-visible:bg-brand-main/10 !cursor-pointer",
            disabled && "opacity-60",
            "hover:opacity-100",
            className
          )}
          disabled={isManageMode && nativeAsset}
        >
          <AssetLogo
            asset={asset}
            alt={name}
            className="w-11 h-11 min-w-[2.75rem] mr-3"
          />
          <span className="flex flex-col w-full min-w-0">
            <span className="flex items-end">
              <span className="text-sm font-bold leading-5 truncate mr-auto">
                {name}
              </span>
              {!isManageMode && (
                <FiatAmount
                  amount={balanceUSD}
                  copiable
                  className={"text-sm font-bold leading-5 ml-2"}
                  threeDots={false}
                  asSpan
                  isDecimalsMinified
                />
              )}
            </span>
            <span className="mt-1 flex justify-between items-end">
              <PrettyAmount
                amount={rawBalance ?? 0}
                decimals={decimals}
                currency={symbol}
                className={classNames(
                  // "text-sm",
                  "text-xs leading-4",
                  "text-brand-inactivedark"
                )}
                copiable={!isManageMode}
                asSpan
                threeDots={false}
              />
              {!isManageMode && priceUSDChange && +priceUSDChange !== 0 && (
                <span
                  className={classNames(
                    "inline-flex items-center",
                    "opacity-75",
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
                asSpan
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
                Icon={InfoRoundIcon}
                onClick={() =>
                  openLink({ page: Page.Default, token: asset.tokenSlug })
                }
              >
                Info
              </PopoverButton>
              <PopoverButton
                Icon={SendIcon}
                onClick={() =>
                  openLink({ page: Page.Transfer, token: asset.tokenSlug })
                }
              >
                Transfer
              </PopoverButton>
              <PopoverButton
                Icon={SwapIcon}
                onClick={() => openLink({ page: Page.Swap })}
              >
                Swap
              </PopoverButton>
              {asset.tokenSlug === NATIVE_TOKEN_SLUG && (
                <PopoverButton
                  Icon={BuyIcon}
                  onClick={() =>
                    openLink({
                      page: Page.Receive,
                      receive: ReceiveTabEnum.BuyWithCrypto,
                    })
                  }
                >
                  Buy
                </PopoverButton>
              )}
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
