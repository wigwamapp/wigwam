import { forwardRef, memo, useMemo } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import BigNumber from "bignumber.js";
import classNames from "clsx";

import { AccountAsset, TokenStatus } from "core/types";
import AssetLogo from "app/components/elements/AssetLogo";
import FiatAmount from "app/components/elements/FiatAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import PriceArrow from "app/components/elements/PriceArrow";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

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
      ref,
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
        [priceUSDChange],
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
                    "w-full h-full",
                    "flex items-center justify-center",
                    (disabled || nativeAsset) && "opacity-30",
                  )}
                >
                  {!disabled && (
                    <CheckIcon className="[&>*]:fill-black w-full h-full" />
                  )}
                </Checkbox.Indicator>
              </span>
            </Checkbox.Root>
          ) : null}

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
                  isManageMode && "mr-14",
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
                  hoverable && "group-hover:text-brand-light",
                  "transition-colors",
                  "truncate min-w-0",
                  isManageMode && "mr-14",
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
                    priceClassName,
                  )}
                >
                  <PriceArrow
                    className={classNames(
                      "w-2 h-2 mr-[0.125rem]",
                      +priceUSDChange < 0 && "transform rotate-180",
                    )}
                  />

                  <span className="text-xs leading-4">
                    {new BigNumber(priceUSDChange).abs().toFixed(2)}%
                  </span>
                </span>
              )}
              {/* {isManageMode && !nativeAsset && (
                <Checkbox.Root
                  className={classNames(
                    "absolute top-1/2 right-5 -translate-y-1/2",
                    "w-5 h-5 min-w-[1.25rem]",
                    "bg-brand-main/20",
                    "rounded",
                    "flex items-center justify-center",
                    !disabled && "border border-brand-main",
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
              )} */}
            </span>
          </span>
        </button>
      );
    },
  ),
);

export default AssetCard;
