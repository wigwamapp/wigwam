import {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import BigNumber from "bignumber.js";
import { Transaction } from "ethers";
import classNames from "clsx";

import { FEE_MODES, FeeMode, FeeSuggestions, AccountAsset } from "core/types";
import { getGasPriceStep } from "core/common/transaction";

import { useToken } from "app/hooks";
import {
  FEE_MODE_NAMES,
  formatUnits,
  parseUnits,
  prepareAmountOnChange,
} from "app/utils/txApprove";
import PrettyAmount from "app/components/elements/PrettyAmount";
import FiatAmount from "app/components/elements/FiatAmount";
import TabHeader from "app/components/elements/approvals/TabHeader";
import PlusMinusInput from "app/components/elements/approvals/PlusMinusInput";

type FeeTabProps = {
  accountAddress: string;
  originTx: Transaction;
  fees: FeeSuggestions | null;
  l1Fee: bigint | null;
  averageGasLimit: bigint | null;
  maxFee: bigint | null;
  averageFee: bigint | null;
  feeMode: FeeMode;
  setFeeMode: Dispatch<FeeMode>;
  overrides: Partial<Transaction>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Transaction>>>;
};

const FeeTab = memo<FeeTabProps>(
  ({
    accountAddress,
    originTx: tx,
    overrides,
    onOverridesChange,
    fees,
    l1Fee,
    averageGasLimit,
    maxFee,
    averageFee,
    feeMode,
    setFeeMode,
  }) => {
    const changeStepDecimals = fees
      ? getGasPriceStep(fees?.modes.average.max).toString().length - 1
      : 8;
    const changeValue = useCallback(
      (name: string, value: bigint | null) => {
        onOverridesChange((o) => ({ ...o, [name]: value ?? "" }));
      },
      [onOverridesChange],
    );

    const fixValue = useCallback(
      (name: string, value?: string) => {
        if (!value) {
          onOverridesChange((o) => ({ ...o, [name]: null }));
        }
      },
      [onOverridesChange],
    );

    const handleFeeModeChange = useCallback(
      (mode: FeeMode) => {
        if (!mode) return;

        setFeeMode(mode);
        // Clean-up ovverides if mode (re)enabled
        onOverridesChange(
          (o) =>
            ({
              ...o,
              gasPrice: null,
              maxFeePerGas: null,
              maxPriorityFeePerGas: null,
            }) as any,
        );
      },
      [setFeeMode, onOverridesChange],
    );

    return (
      <>
        <TabHeader>Edit network fee</TabHeader>
        {fees && averageGasLimit && maxFee !== null && averageFee !== null && (
          <FeeModeSelect
            accountAddress={accountAddress}
            gasLimit={overrides.gasLimit ?? tx.gasLimit!}
            averageGasLimit={averageGasLimit}
            fees={fees}
            l1Fee={l1Fee}
            maxFee={maxFee}
            averageFee={averageFee}
            value={feeMode}
            onValueChange={handleFeeModeChange}
            className="mb-8"
          />
        )}

        {fees?.type === "modern" ? (
          <>
            <PlusMinusInput
              label="Max base fee"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              currency="GWEI"
              tooltip={
                <>
                  When your transaction gets included in the block, any
                  difference between your max base fee and the actual base fee
                  will be refunded. Total amount is calculated as max base fee
                  (in GWEI) * gas limit.
                </>
              }
              tooltipProps={{
                size: "large",
                placement: "top",
              }}
              value={formatUnits(
                overrides.maxFeePerGas ?? tx.maxFeePerGas,
                "gwei",
              )}
              onChange={(e) =>
                changeValue("maxFeePerGas", parseUnits(e.target.value, "gwei"))
              }
              onBlur={(e) => fixValue("maxFeePerGas", e.target.value)}
              className="mb-3"
              onMinusClick={() =>
                changeValue(
                  "maxFeePerGas",
                  prepareAmountOnChange({
                    value: (
                      overrides.maxFeePerGas ??
                      tx.maxFeePerGas ??
                      0
                    ).toString(),
                    decimals: changeStepDecimals,
                    operator: "minus",
                  }),
                )
              }
              onPlusClick={() =>
                changeValue(
                  "maxFeePerGas",
                  prepareAmountOnChange({
                    value: (
                      overrides.maxFeePerGas ??
                      tx.maxFeePerGas ??
                      0
                    ).toString(),
                    decimals: changeStepDecimals,
                  }),
                )
              }
            />

            <PlusMinusInput
              label="Priority fee"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              currency="GWEI"
              tooltip={
                <>
                  Priority fee (aka “miner tip”) goes directly to miners and
                  incentivizes them to prioritize your transaction.
                </>
              }
              tooltipProps={{
                size: "large",
                placement: "top",
              }}
              value={formatUnits(
                overrides.maxPriorityFeePerGas ?? tx.maxPriorityFeePerGas,
                "gwei",
              )}
              onChange={(e) =>
                changeValue(
                  "maxPriorityFeePerGas",
                  parseUnits(e.target.value, "gwei"),
                )
              }
              onBlur={(e) => fixValue("maxPriorityFeePerGas", e.target.value)}
              onMinusClick={() =>
                changeValue(
                  "maxPriorityFeePerGas",
                  prepareAmountOnChange({
                    value: (
                      overrides.maxPriorityFeePerGas ??
                      tx.maxPriorityFeePerGas ??
                      0
                    ).toString(),
                    decimals: changeStepDecimals,
                    operator: "minus",
                  }),
                )
              }
              onPlusClick={() =>
                changeValue(
                  "maxPriorityFeePerGas",
                  prepareAmountOnChange({
                    value: (
                      overrides.maxPriorityFeePerGas ??
                      tx.maxPriorityFeePerGas ??
                      0
                    ).toString(),
                    decimals: changeStepDecimals,
                  }),
                )
              }
            />
          </>
        ) : (
          <PlusMinusInput
            label="Gas Price"
            placeholder="0.00"
            className="mb-4"
            thousandSeparator
            decimalScale={9}
            currency="GWEI"
            tooltip={
              <>
                This network requires a “Gas price” field when submitting a
                transaction. Gas price is the amount you will pay pay per unit
                of gas.
              </>
            }
            value={formatUnits(overrides.gasPrice ?? tx.gasPrice, "gwei")}
            onChange={(e) =>
              changeValue("gasPrice", parseUnits(e.target.value, "gwei"))
            }
            onBlur={(e) => fixValue("gasPrice", e.target.value)}
            onMinusClick={() =>
              changeValue(
                "gasPrice",
                prepareAmountOnChange({
                  value: (overrides.gasPrice ?? tx.gasPrice ?? 0).toString(),
                  decimals: changeStepDecimals,
                  operator: "minus",
                }),
              )
            }
            onPlusClick={() =>
              changeValue(
                "gasPrice",
                prepareAmountOnChange({
                  value: (overrides.gasPrice ?? tx.gasPrice ?? 0).toString(),
                  decimals: changeStepDecimals,
                }),
              )
            }
          />
        )}
      </>
    );
  },
);

export default FeeTab;

type FeeModeSelectProps = {
  accountAddress: string;
  gasLimit: bigint;
  averageGasLimit: bigint;
  fees: FeeSuggestions;
  l1Fee: bigint | null;
  maxFee: bigint;
  averageFee: bigint;
  value: FeeMode;
  onValueChange: (value: FeeMode) => void;
  className?: string;
};

const FeeModeSelect = memo<FeeModeSelectProps>(
  ({
    accountAddress,
    gasLimit,
    averageGasLimit,
    fees,
    l1Fee,
    averageFee,
    value,
    onValueChange,
    className,
  }) => {
    gasLimit = useMemo(
      () =>
        BigInt(gasLimit) > BigInt(averageGasLimit) ? averageGasLimit : gasLimit,
      [averageGasLimit, gasLimit],
    );

    return (
      <ToggleGroup.Root
        type="single"
        orientation="horizontal"
        value={
          gasLimit * fees.modes[value].max + (l1Fee ?? 0n) === averageFee
            ? value
            : undefined
        }
        onValueChange={onValueChange}
        className={classNames("grid grid-cols-3 gap-2.5", className)}
      >
        {FEE_MODES.map((mode) => {
          const modeMaxFee = gasLimit * fees.modes[mode].max + (l1Fee ?? 0n);

          return (
            <FeeModeItem
              key={mode}
              accountAddress={accountAddress}
              value={mode}
              fee={modeMaxFee}
              selected={modeMaxFee === averageFee}
            />
          );
        })}
      </ToggleGroup.Root>
    );
  },
);

type FeeModeItemProps = {
  accountAddress: string;
  value: FeeMode;
  fee: bigint;
  selected: boolean;
};

const FeeModeItem: FC<FeeModeItemProps> = ({
  accountAddress,
  value,
  fee,
  selected,
}) => {
  const nativeToken = useToken<AccountAsset>(accountAddress);

  const usdAmount =
    fee && nativeToken?.priceUSD
      ? new BigNumber(fee.toString())
          .div(new BigNumber(10).pow(nativeToken.decimals))
          .multipliedBy(nativeToken.priceUSD)
      : new BigNumber(0);

  return (
    <ToggleGroup.Item
      value={value}
      className={classNames(
        "relative",
        "bg-brand-main/5",
        "flex flex-col items-center",
        "w-full py-2 px-1",
        "rounded-[.625rem]",
        "transition-colors",
        "group",
        !selected && "hover:bg-brand-main/10",
        selected && "bg-brand-main/[.2]",
      )}
    >
      <span className="mb-1.5 text-sm items-center">
        <span className="mr-1.5">{FEE_MODE_NAMES[value].icon}</span>
        {FEE_MODE_NAMES[value].name}
      </span>

      <FiatAmount
        amount={usdAmount}
        threeDots={false}
        className="text-sm font-bold mb-0.5 truncate"
      />

      {nativeToken && (
        <PrettyAmount
          amount={fee.toString()}
          currency={nativeToken.symbol}
          decimals={nativeToken.decimals}
          threeDots={false}
          className={classNames(
            "text-xs text-brand-inactivedark truncate",
            "transition-colors",
            selected && "!text-brand-light",
          )}
        />
      )}
    </ToggleGroup.Item>
  );
};
