import {
  FC,
  forwardRef,
  useCallback,
  memo,
  useState,
  useMemo,
  ButtonHTMLAttributes,
  Dispatch,
  SetStateAction,
  MouseEventHandler,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";
import { dequal } from "dequal/lite";
import BigNumber from "bignumber.js";

import { AccountAsset, TokenStatus } from "core/types";
import * as repo from "core/repo";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { IS_FIREFOX } from "app/defaults";
import { Page, ReceiveTab as ReceiveTabEnum } from "app/nav";
import { openInTab } from "app/helpers";
import { chainIdAtom, currentAccountAtom } from "app/atoms";

import { ReactComponent as PopoverIcon } from "app/icons/popover.svg";
import { ReactComponent as InfoRoundIcon } from "app/icons/info-round.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/receive-small.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy.svg";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

import IconedButton from "app/components/elements/IconedButton";
import FiatAmount from "app/components/elements/FiatAmount";
import AssetLogo from "app/components/elements/AssetLogo";
import PrettyAmount from "app/components/elements/PrettyAmount";
import PriceArrow from "app/components/elements/PriceArrow";

type AssetCardProps = {
  asset: AccountAsset;
  setReceivePopupOpened: Dispatch<SetStateAction<boolean>>;
  isManageMode?: boolean;
  className?: string;
};

const AssetCard = memo(
  forwardRef<HTMLButtonElement, AssetCardProps>(
    (
      { asset, setReceivePopupOpened, isManageMode = false, className },
      ref
    ) => {
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

      const handleAssetContextMenu = useCallback<
        MouseEventHandler<HTMLButtonElement>
      >(
        async (evt) => {
          if (!isManageMode) {
            evt.preventDefault();
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
                IS_FIREFOX && "!bg-[#111226]",
                "border border-brand-light/5",
                "rounded-[.625rem]",
                "px-1 py-2",
                "z-[1]"
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
                Icon={ReceiveIcon}
                onClick={() => {
                  setPopoverOpened(false);
                  setReceivePopupOpened(true);
                }}
              >
                Receive
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
                disabled
                title="Coming soon"
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
                  disabled
                  title="Coming soon"
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

export default AssetCard;

type PopoverButton = ButtonHTMLAttributes<HTMLButtonElement> & {
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
      !rest.disabled && "hover:bg-brand-main/20 focus:bg-brand-main/20",
      "disabled:opacity-40 disabled:cursor-default"
    )}
    {...rest}
  >
    <Icon className="mr-2" />
    {children}
  </button>
);
