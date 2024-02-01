import {
  FC,
  forwardRef,
  useCallback,
  memo,
  useState,
  ButtonHTMLAttributes,
  MouseEventHandler,
} from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import { dequal } from "dequal/lite";
import BigNumber from "bignumber.js";

import { AccountAsset, TokenStatus } from "core/types";
import { toggleTokenStatus } from "core/common/tokens";

import { Page } from "app/nav";
import { openInTab } from "app/helpers";
import { chainIdAtom } from "app/atoms";

import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy-action.svg";
import { ReactComponent as CheckIcon } from "app/icons/check.svg";

import FiatAmount from "app/components/elements/FiatAmount";
import AssetLogo from "app/components/elements/AssetLogo";
import PrettyAmount from "app/components/elements/PrettyAmount";
import Button from "app/components/elements/Button";
import PopupModal from "./PopupModal";
import PriceChange from "../overview/PriceChange";

type AssetCardProps = {
  asset: AccountAsset;
  isManageMode?: boolean;
  className?: string;
};

const AssetCard = memo(
  forwardRef<HTMLButtonElement, AssetCardProps>(
    ({ asset, isManageMode = false, className }, ref) => {
      const [openModal, setModalOpen] = useState(false);
      const [popoverOpened, setPopoverOpened] = useState(false);

      const {
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

      const handleAssetClick = useCallback(async () => {
        if (isManageMode) {
          await toggleTokenStatus(asset);
        } else {
          setModalOpen(true);
        }
      }, [isManageMode, asset]);

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
        [isManageMode, popoverOpened],
      );
      return (
        <>
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
              "hover:bg-brand-main/10 focus-visible:bg-brand-main/10 !cursor-pointer",
              disabled && "opacity-60",
              "hover:opacity-100",
              className,
            )}
            disabled={isManageMode && nativeAsset}
          >
            {isManageMode ? (
              <Checkbox.Root
                className={classNames(
                  "w-5 h-5 min-w-[1.25rem] mx-2 my-auto",
                  "bg-[#373B45]",
                  "rounded",
                  "flex items-center justify-center",
                )}
                checked={!disabled}
                disabled={nativeAsset}
                asChild
              >
                <span>
                  <Checkbox.Indicator
                    className={classNames(
                      "bg-brand-redone rounded",
                      (disabled || nativeAsset) && "opacity-30",
                    )}
                  >
                    {!disabled && <CheckIcon className="[&>*]:fill-black" />}
                  </Checkbox.Indicator>
                </span>
              </Checkbox.Root>
            ) : null}
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
                    "text-xs leading-4",
                    "text-brand-inactivedark",
                  )}
                  asSpan
                  threeDots={false}
                />
                {priceUSDChange && !isManageMode ? (
                  <PriceChange
                    className="!p-0 !text-xs !font-normal"
                    priceChange={priceUSDChange}
                    isPercent
                    hideBackground
                  />
                ) : null}
              </span>
            </span>
          </button>
          <AssetModal
            open={openModal}
            onClose={() => setModalOpen(false)}
            asset={asset}
          />
        </>
      );
    },
  ),
  dequal,
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
      "disabled:opacity-40 disabled:cursor-default",
    )}
    {...rest}
  >
    <Icon className="mr-2 w-6 h-auto" />
    {children}
  </button>
);

interface IAssetModalProps {
  open: boolean;
  onClose: () => void;
  asset: AccountAsset;
}

const AssetModal: FC<IAssetModalProps> = ({ open, asset, onClose }) => {
  const {
    balanceUSD,
    name,
    decimals,
    symbol,
    rawBalance,
    priceUSD,
    priceUSDChange,
    chainId,
  } = asset;
  const setInternalChainId = useSetAtom(chainIdAtom);

  const openLink = useCallback(
    (to: Record<string, unknown>) => {
      setInternalChainId(chainId);
      openInTab(to);
    },
    [setInternalChainId, chainId],
  );

  return (
    <PopupModal
      open={open}
      small
      onOpenChange={onClose}
      disabledClickOutside
      headerClassName="!m-0"
      header={
        <p className="flex items-center text-base font-normal">
          <span className="mr-2 font-semibold">{name}</span>
          {priceUSD ? (
            <span className="text-sm text-[#93ACAF]">
              ${new BigNumber(priceUSD).toFixed(2, BigNumber.ROUND_DOWN)}
            </span>
          ) : null}
          {priceUSDChange ? (
            <PriceChange
              className="!p-0 !text-xs [&>*]:font-normal"
              priceChange={priceUSDChange}
              isPercent={true}
              hideBackground
            />
          ) : null}
        </p>
      }
    >
      <div className="flex flex-col w-full">
        <div className="mb-6 flex w-full items-center">
          <AssetLogo asset={asset} className="w-8 h-8 mr-2 shrink-0" />
          <div className="w-full flex justify-between">
            <div className="flex flex-col">
              <PrettyAmount
                amount={rawBalance ?? 0}
                decimals={decimals}
                currency={symbol}
                className="mb-1 font-semibold text-base"
                copiable
                asSpan
                threeDots={false}
              />
              <span className="text-xs text-brand-inactivedark">ERC20</span>
            </div>
            <div className="flex flex-col items-end">
              <FiatAmount
                className="mb-1 font-semibold text-base"
                amount={balanceUSD}
                threeDots={false}
                isDecimalsMinified
                copiable
                asSpan
              />
              {priceUSDChange ? (
                <PriceChange
                  className="!p-0"
                  textClassName="!font-normal !text-xs"
                  hideBackground
                  priceChange={new BigNumber(priceUSDChange)
                    .times(balanceUSD)
                    .div(100)}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="mb-10 flex justify-center gap-9">
          <DeepLinkButton
            text="Send"
            onClick={() =>
              openLink({ page: Page.Transfer, token: asset.tokenSlug })
            }
            Icon={SendIcon}
          />
          <DeepLinkButton
            text="Buy"
            onClick={() =>
              openLink({ page: Page.Receive, token: asset.tokenSlug })
            }
            Icon={BuyIcon}
          />
          <DeepLinkButton
            text="Swap"
            onClick={() =>
              openLink({ page: Page.Swap, token: asset.tokenSlug })
            }
            Icon={SwapIcon}
          />
        </div>
        <Button
          theme="secondary"
          onClick={() => openInTab(undefined, ["token"])}
        >
          <ExpandIcon className="mr-3" />
          Open Full
        </Button>
      </div>
    </PopupModal>
  );
};

const DeepLinkButton: FC<{
  text: string;
  Icon: FC<{ className?: string }>;
  onClick: () => void;
}> = ({ text, onClick, Icon }) => {
  return (
    <Button theme="clean" className="!p-0" onClick={onClick}>
      <div className="flex flex-col items-center">
        <div className="mb-1 p-3 bg-[#373B45] rounded-full">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs">{text}</span>
      </div>
    </Button>
  );
};
