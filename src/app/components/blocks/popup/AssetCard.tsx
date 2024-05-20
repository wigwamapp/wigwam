import {
  FC,
  forwardRef,
  useCallback,
  memo,
  useState,
  ButtonHTMLAttributes,
  useMemo,
  Suspense,
} from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import { dequal } from "dequal/lite";
import BigNumber from "bignumber.js";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { useLazyAtomValue } from "lib/atom-utils";
import { TokenStandardValue } from "fixtures/tokens";

import { AccountAsset, TokenStatus } from "core/types";
import { parseTokenSlug, toggleTokenStatus } from "core/common/tokens";
import { TEvent, trackEvent } from "core/client";

import { Page } from "app/nav";
import { openInTab } from "app/helpers";
import { chainIdAtom, getTokenDetailsUrlAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useExplorerLink,
  useLazyNetwork,
  useHideToken,
  useRamp,
  ChainIdProvider,
} from "app/hooks";

import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as CheckIcon } from "app/icons/check.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as CoinGeckoIcon } from "app/icons/coingecko.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/buy-action.svg";
import { ReactComponent as BuyIcon } from "app/icons/plus-rounded.svg";

import FiatAmount from "app/components/elements/FiatAmount";
import AssetLogo from "app/components/elements/AssetLogo";
import PrettyAmount from "app/components/elements/PrettyAmount";
import Button from "app/components/elements/Button";
import PriceChange from "app/components/elements/PriceChange";
import IconedButton from "app/components/elements/IconedButton";

import PopupModal from "./PopupModal";
import { navigate } from "lib/navigation";

type AssetCardProps = {
  asset: AccountAsset;
  isManageMode?: boolean;
  className?: string;
};

const AssetCard = memo(
  forwardRef<HTMLButtonElement, AssetCardProps>(
    ({ asset, isManageMode = false, className }, ref) => {
      const [openModal, setModalOpen] = useState(false);

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

      return (
        <>
          <button
            ref={ref}
            type="button"
            onClick={handleAssetClick}
            className={classNames(
              "relative",
              "flex items-stretch",
              "w-full py-2 px-3",
              "text-left",
              "rounded-[.625rem]",
              "cursor-default",
              "group",
              "transition",
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
                  "w-5 h-5 min-w-[1.25rem] mr-5 my-auto",
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

          <Suspense>
            <ChainIdProvider chainId={asset.chainId}>
              <AssetModal
                open={openModal}
                onReceive={() => {
                  navigate((s) => ({
                    ...s,
                    receiveOpened: true,
                    receiveToken: asset.tokenSlug,
                  }));
                }}
                onClose={() => setModalOpen(false)}
                asset={asset}
              />
            </ChainIdProvider>
          </Suspense>
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
  onReceive: () => void;
  onClose: () => void;
  asset: AccountAsset;
}

const AssetModal: FC<IAssetModalProps> = ({
  open,
  onReceive,
  asset,
  onClose,
}) => {
  const {
    balanceUSD,
    name,
    decimals,
    symbol,
    rawBalance,
    priceUSD,
    priceUSDChange,
    chainId,
    status,
  } = asset;
  const setInternalChainId = useSetAtom(chainIdAtom);
  const { onRampCurrency } = useRamp(asset.tokenSlug);

  const openLink = useCallback(
    (to: Record<string, unknown>) => {
      setInternalChainId(chainId);
      openInTab(to);
    },
    [setInternalChainId, chainId],
  );

  const showBuyButton = useMemo(
    () => status !== TokenStatus.Disabled && onRampCurrency,
    [status, onRampCurrency],
  );

  return (
    <PopupModal
      open={open}
      small
      onOpenChange={onClose}
      headerClassName="!m-0"
      header={
        <div className="flex flex-col items-start text-base font-normal">
          <p className="font-semibold">{name}</p>
          <div className="mt-2 flex gap-2">
            {priceUSD ? (
              <span className="text-base text-white font-semibold">
                ${new BigNumber(priceUSD).toFixed(2, BigNumber.ROUND_DOWN)}
              </span>
            ) : null}
            {priceUSDChange ? (
              <PriceChange priceChange={priceUSDChange} isPercent={true} />
            ) : null}
          </div>

          <TokenActionButtons
            asset={asset}
            onClose={onClose}
            className="mt-4"
          />
        </div>
      }
    >
      <div className="flex flex-col w-full">
        <div className="mb-6 flex w-full items-center">
          <AssetLogo asset={asset} className="w-10 h-10 mr-2 shrink-0" />
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
        <div className="mb-8 flex justify-center gap-9">
          <DeepLinkButton
            text="Send"
            onClick={() =>
              openLink({ page: Page.Transfer, token: asset.tokenSlug })
            }
            Icon={SendIcon}
          />
          <Button
            theme="clean"
            className="!p-0"
            innerClassName="flex flex-col"
            onClick={onReceive}
          >
            <div className="mb-1 py-[0.78125rem] px-[0.8125rem] bg-[#373B45] rounded-full">
              <ReceiveIcon />
            </div>
            <span className="text-xs font-medium">Receive</span>
          </Button>
          <DeepLinkButton
            text="Buy"
            onClick={() => {
              trackEvent(TEvent.BuyNavigated, {
                page: "popup",
                tokenName: name,
                tokenSymbol: symbol,
                chainId,
              });

              openLink({
                page: Page.Buy,
                token: asset.tokenSlug,
                onRampOpened: true,
              });
            }}
            Icon={BuyIcon}
            disabled={!showBuyButton}
          />
          <DeepLinkButton
            text="Swap"
            onClick={() => {
              trackEvent(TEvent.SwapNavigated, {
                page: "popup",
                tokenName: name,
                tokenSymbol: symbol,
                chainId,
              });

              openLink({ page: Page.Swap, token: asset.tokenSlug });
            }}
            Icon={SwapIcon}
          />
        </div>
        <Button
          theme="secondary"
          onClick={() =>
            openLink({ page: Page.Default, token: asset.tokenSlug })
          }
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
  disabled?: boolean;
}> = ({ text, onClick, Icon, disabled = false }) => {
  return (
    <Button
      theme="clean"
      className="!p-0"
      disabled={disabled}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className="mb-1 p-3 bg-[#373B45] rounded-full">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs">{text}</span>
      </div>
    </Button>
  );
};

const TokenActionButtons: FC<{
  asset: AccountAsset;
  onClose: () => void;
  className?: string;
}> = ({ asset, onClose, className }) => {
  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);

  const { chainId, tokenSlug, status } = asset;

  const { standard, address } = useMemo(
    () => parseTokenSlug(tokenSlug),
    [tokenSlug],
  );

  const { copy, copied } = useCopyToClipboard(address);

  const tokenDetailsUrl = useLazyAtomValue(
    getTokenDetailsUrlAtom({ chainId, tokenSlug }),
    "off",
  );

  const handleHideAsset = useHideToken(asset, onClose);

  return (
    <div className={classNames("flex items-center", className)}>
      <TippySingletonProvider>
        <div className="ml-auto flex items-center">
          {tokenDetailsUrl && (
            <IconedButton
              aria-label="View chart and token info"
              Icon={CoinGeckoIcon}
              className={classNames(
                "!w-6 !h-6 min-w-[1.5rem]",
                status !== TokenStatus.Native ? "mr-2" : "",
              )}
              iconClassName="!w-[1.125rem]"
              href={tokenDetailsUrl}
            />
          )}
          {explorerLink && status !== TokenStatus.Native && (
            <IconedButton
              aria-label="View token in Explorer"
              Icon={WalletExplorerIcon}
              className="!w-6 !h-6 min-w-[1.5rem] mr-2"
              iconClassName="!w-[1.125rem]"
              href={explorerLink.token(address)}
            />
          )}
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
              onClick={() => copy()}
            />
          )}
          {status !== TokenStatus.Native && (
            <IconedButton
              aria-label="Hide token"
              Icon={EyeIcon}
              onClick={() => handleHideAsset()}
              className="!w-6 !h-6 min-w-[1.5rem]"
              iconClassName="!w-[1.125rem]"
            />
          )}
        </div>
      </TippySingletonProvider>
    </div>
  );
};
