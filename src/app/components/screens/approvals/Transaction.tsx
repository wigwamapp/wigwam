import {
  FC,
  ReactNode,
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import { ethers } from "ethers";
import * as Tabs from "@radix-ui/react-tabs";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { createOrganicThrottle } from "lib/system/organicThrottle";

import {
  TransactionApproval,
  TxActionType,
  FeeMode,
  FeeSuggestions,
  FEE_MODES,
} from "core/types";
import { approveItem, findToken, suggestFees } from "core/client";
import { getNextNonce } from "core/common/nonce";
import { isSmartContractAddress, matchTxAction } from "core/common/transaction";

import {
  useChainId,
  useNativeCurrency,
  useOnBlock,
  useProvider,
  useSync,
  useToken,
} from "app/hooks";
import { allAccountsAtom, getLocalNonceAtom } from "app/atoms";
import { withHumanDelay } from "app/utils";
import WalletCard from "app/components/elements/WalletCard";
import NumberInput from "app/components/elements/NumberInput";
import LongTextField from "app/components/elements/LongTextField";
import NetworkPreview from "app/components/elements/NetworkPreview";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import PrettyAmount from "app/components/elements/PrettyAmount";

import ApprovalLayout from "./Layout";

const TAB_VALUES = ["details", "fee", "advanced", "raw", "error"] as const;

const TAB_NAMES: Record<TabValue, ReactNode> = {
  details: "Details",
  fee: "Fee",
  advanced: "Advanced",
  raw: "Raw",
  error: "Error",
};

const FEE_MODE_NAMES: Record<FeeMode, ReactNode> = {
  low: "Low",
  average: "Average",
  high: "High",
};

type TabValue = typeof TAB_VALUES[number];
type Tx = ethers.utils.UnsignedTransaction;

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const { accountAddress, txParams } = approval;
  const chainId = useChainId();

  const [allAccounts, localNonce] = useAtomValue(
    waitForAll([
      allAccountsAtom,
      getLocalNonceAtom({ chainId, accountAddress }),
    ])
  );

  useSync(chainId, accountAddress);

  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts]
  );

  const action = useMemo(() => {
    try {
      return matchTxAction(txParams);
    } catch (err) {
      console.warn(err);
      return null;
    }
  }, [txParams]);

  const provider = useProvider();
  const nativeToken = useToken(accountAddress);

  const [tabValue, setTabValue] = useState<TabValue>("details");
  const [feeMode, setFeeMode] = useState<FeeMode>("average");
  const [estimating, setEstimating] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  const [prepared, setPrepared] = useState<{
    tx: Tx;
    fees: FeeSuggestions | null;
    destinationIsContract: boolean;
  }>();
  const [txOverrides, setTxOverrides] = useState<Partial<Tx>>({});

  const preparedTx = prepared?.tx;
  const fees = prepared?.fees;

  const originTx = useMemo(() => {
    if (!prepared) return null;

    const tx = { ...prepared.tx };
    tx.nonce = getNextNonce(tx, localNonce);

    const feeSug = prepared.fees?.modes[feeMode];
    if (feeSug) {
      if (prepared.tx.maxPriorityFeePerGas) {
        tx.maxFeePerGas = feeSug.max;
        if ("priority" in feeSug) {
          tx.maxPriorityFeePerGas = feeSug.priority;
        }
      } else {
        tx.gasPrice = feeSug.max;
      }
    }

    return tx;
  }, [prepared, feeMode, localNonce]);

  const finalTx = useMemo<typeof originTx>(() => {
    if (!originTx) return originTx;

    const tx = { ...originTx };

    for (const [key, value] of Object.entries(txOverrides)) {
      if (value || value === 0) {
        (tx as any)[key] = value;
      }
    }

    return tx;
  }, [originTx, txOverrides]);

  const maxFee = useMemo(() => {
    if (!finalTx) return null;

    try {
      const gasPrice = finalTx.maxFeePerGas || finalTx.gasPrice;
      return ethers.BigNumber.from(finalTx.gasLimit).mul(gasPrice!);
    } catch {
      return null;
    }
  }, [finalTx]);

  const withThrottle = useMemo(createOrganicThrottle, []);

  const estimateTx = useCallback(
    () =>
      withThrottle(async () => {
        setEstimating(true);

        try {
          const { gasLimit, ...rest } = txParams;

          const [tx, feeSuggestions, destinationIsContract] = await Promise.all(
            [
              provider.getUncheckedSigner(account.address).populateTransaction({
                ...rest,
                type: bnify(rest?.type)?.toNumber(),
                chainId: bnify(rest?.chainId)?.toNumber(),
              }),
              suggestFees(provider).catch(() => null),
              txParams.to
                ? isSmartContractAddress(provider, txParams.to)
                : false,
            ]
          );

          delete tx.from;

          const estimatedGasLimit = ethers.BigNumber.from(tx.gasLimit);
          const minGasLimit = estimatedGasLimit.mul(5).div(4);
          const averageGasLimit = estimatedGasLimit.mul(3).div(2);

          setPrepared({
            tx: {
              ...tx,
              nonce: bnify(tx.nonce)?.toNumber(),
              gasLimit:
                gasLimit && minGasLimit.lte(gasLimit)
                  ? ethers.BigNumber.from(gasLimit)
                  : averageGasLimit,
            },
            fees: feeSuggestions,
            destinationIsContract,
          });
        } catch (err) {
          console.error(err);
          setLastError(err);
        }

        setEstimating(false);
      }),
    [
      withThrottle,
      setEstimating,
      setPrepared,
      provider,
      account.address,
      txParams,
      setLastError,
    ]
  );

  useEffect(() => {
    estimateTx();
  }, [estimateTx]);

  useOnBlock(estimateTx);

  useEffect(() => {
    setTabValue(lastError ? "error" : "details");
  }, [setTabValue, lastError]);

  useEffect(() => {
    if (!action) return;

    switch (action.type) {
      case TxActionType.TokenTransfer:
        action.tokens.forEach(({ slug }) => {
          findToken(chainId, accountAddress, slug);
        });
        break;

      case TxActionType.TokenApprove:
        if (action.tokenSlug) {
          findToken(chainId, accountAddress, action.tokenSlug);
        }
        break;
    }
  }, [action, chainId, accountAddress]);

  // TODO: Only for dev mode
  // START

  useEffect(() => {
    console.info("action", action);
  }, [action]);

  useEffect(() => {
    if (preparedTx && finalTx) {
      console.info({ preparedTx, finalTx });

      if (fees) {
        const { low, average, high } = fees.modes;
        console.info(
          "f",
          [low, average, high].map((m) => formatUnits(m.max, "gwei"))
        );
      }
    }
  }, [preparedTx, fees, finalTx]);

  // TODO: Only for dev mode
  // END

  const handleApprove = useCallback(
    async (approved: boolean) => {
      setLastError(null);
      setApproving(true);

      try {
        await withHumanDelay(async () => {
          let rawTx: string | undefined;

          if (approved) {
            if (!finalTx) return;

            rawTx = ethers.utils.serializeTransaction(finalTx);
          }

          await approveItem(approval.id, { approved, rawTx });
        });
      } catch (err) {
        console.error(err);
        setLastError(err);
        setApproving(false);
      }
    },
    [approval, setLastError, setApproving, finalTx]
  );

  return (
    <ApprovalLayout
      approveText={lastError ? "Retry" : "Approve"}
      onApprove={handleApprove}
      disabled={estimating}
      approving={approving}
    >
      <ScrollAreaContainer
        className="w-full box-content -mr-5 pr-5"
        viewPortClassName="viewportBlock"
      >
        <NetworkPreview className="mb-4" />

        <WalletCard account={account} className="!w-full" />

        <Tabs.Root
          defaultValue="details"
          orientation="horizontal"
          value={tabValue}
          onValueChange={(v) => setTabValue(v as TabValue)}
          className="mt-6 w-full"
        >
          <Tabs.List
            aria-label="Approve tabs"
            className={classNames("flex items-center")}
          >
            {TAB_VALUES.map((value, i, arr) => {
              if (value === "error" && !lastError) return null;

              const active = value === tabValue;
              const last = i === arr.length - 1;

              return (
                <Tabs.Trigger
                  key={value}
                  value={value}
                  className={classNames(
                    "font-semibold text-sm",
                    "px-4 py-2",
                    !last && "mr-1",
                    active && "bg-white/10 rounded-md"
                  )}
                >
                  {TAB_NAMES[value]}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          <Tabs.Content value="details">
            <div className="w-full mt-4">
              {maxFee && nativeToken && (
                <div className="text-lg text-brand-inactivelight">
                  <span className="">Max Fee: </span>
                  <PrettyAmount
                    amount={maxFee.toString()}
                    decimals={nativeToken.decimals}
                    currency={nativeToken.symbol}
                    copiable
                    className=""
                  />
                </div>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="fee">
            {originTx ? (
              <TxFee
                originTx={originTx}
                fees={fees ?? null}
                feeMode={feeMode}
                setFeeMode={setFeeMode}
                maxFee={maxFee}
                overrides={txOverrides}
                onOverridesChange={setTxOverrides}
              />
            ) : (
              <Loading />
            )}
          </Tabs.Content>

          <Tabs.Content value="advanced">
            {originTx ? (
              <TxAdvanced
                originTx={originTx}
                overrides={txOverrides}
                onOverridesChange={setTxOverrides}
              />
            ) : (
              <Loading />
            )}
          </Tabs.Content>

          <Tabs.Content value="raw">
            {finalTx ? <TxRaw tx={finalTx} /> : <Loading />}
          </Tabs.Content>

          <Tabs.Content value="error">
            {lastError && (
              <LongTextField
                readOnly
                value={lastError?.message || "Unknown error."}
              />
            )}
          </Tabs.Content>
        </Tabs.Root>
      </ScrollAreaContainer>
    </ApprovalLayout>
  );
};

export default ApproveTransaction;

type TxFeeProps = {
  originTx: Tx;
  fees: FeeSuggestions | null;
  maxFee: ethers.BigNumber | null;
  feeMode: FeeMode;
  setFeeMode: Dispatch<FeeMode>;
  overrides: Partial<Tx>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Tx>>>;
};

const TxFee = memo<TxFeeProps>(
  ({
    originTx: tx,
    overrides,
    onOverridesChange,
    fees,
    maxFee,
    feeMode,
    setFeeMode,
  }) => {
    const changeValue = useCallback(
      (name: string, value: ethers.BigNumberish | null) => {
        onOverridesChange((o) => ({ ...o, [name]: value }));
      },
      [onOverridesChange]
    );

    const fixValue = useCallback(
      (name: string, value?: string) => {
        if (!value) changeValue(name, null);
      },
      [changeValue]
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
            } as any)
        );
      },
      [setFeeMode, onOverridesChange]
    );

    return (
      <div className="w-full my-4">
        {fees && maxFee && (
          <FeeModeSelect
            gasLimit={ethers.BigNumber.from(overrides.gasLimit ?? tx.gasLimit!)}
            fees={fees}
            maxFee={maxFee}
            value={feeMode}
            onValueChange={handleFeeModeChange}
            className="mb-6"
          />
        )}

        {tx.maxPriorityFeePerGas ? (
          <>
            <NumberInput
              label="Max base fee"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              value={formatUnits(
                overrides.maxFeePerGas ?? tx.maxFeePerGas,
                "gwei"
              )}
              onChange={(e) =>
                changeValue("maxFeePerGas", parseUnits(e.target.value, "gwei"))
              }
              onBlur={(e) => fixValue("maxFeePerGas", e.target.value)}
              className="w-full mb-4"
            />

            <NumberInput
              label="Priority fee"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              value={formatUnits(
                overrides.maxPriorityFeePerGas ?? tx.maxPriorityFeePerGas,
                "gwei"
              )}
              onChange={(e) =>
                changeValue(
                  "maxPriorityFeePerGas",
                  parseUnits(e.target.value, "gwei")
                )
              }
              onBlur={(e) => fixValue("maxPriorityFeePerGas", e.target.value)}
              className="w-full mb-4"
            />
          </>
        ) : (
          <>
            <NumberInput
              label="Gas Price"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              value={formatUnits(overrides.gasPrice ?? tx.gasPrice, "gwei")}
              onChange={(e) =>
                changeValue("gasPrice", parseUnits(e.target.value, "gwei"))
              }
              onBlur={(e) => fixValue("gasPrice", e.target.value)}
              className="w-full mb-4"
            />
          </>
        )}
      </div>
    );
  }
);

type FeeModeSelectProps = {
  gasLimit: ethers.BigNumber;
  fees: FeeSuggestions;
  maxFee: ethers.BigNumber;
  value: FeeMode;
  onValueChange: (value: FeeMode) => void;
  className?: string;
};

const FeeModeSelect = memo<FeeModeSelectProps>(
  ({ gasLimit, fees, maxFee, value, onValueChange, className }) => {
    return (
      <ToggleGroup.Root
        type="single"
        orientation="horizontal"
        value={
          gasLimit.mul(fees.modes[value].max).eq(maxFee) ? value : undefined
        }
        onValueChange={onValueChange}
        className={classNames("grid grid-cols-3 gap-2", className)}
      >
        {FEE_MODES.map((mode) => {
          const modeMaxFee = gasLimit.mul(fees.modes[mode].max);

          return (
            <FeeModeItem
              key={mode}
              value={mode}
              fee={modeMaxFee}
              selected={modeMaxFee.eq(maxFee)}
            />
          );
        })}
      </ToggleGroup.Root>
    );
  }
);

type FeeModeItemProps = {
  value: FeeMode;
  fee: ethers.BigNumber;
  selected: boolean;
};

const FeeModeItem: FC<FeeModeItemProps> = ({ value, fee, selected }) => {
  const nativeCurrency = useNativeCurrency();

  return (
    <ToggleGroup.Item
      value={value}
      className={classNames(
        "relative last:flex",
        "bg-brand-main/[.05]",
        "w-full py-2 px-1",
        "rounded-[.25rem]",
        "transition-colors",
        "hover:bg-brand-main/10",
        selected && "bg-brand-main/10"
      )}
    >
      <div className="flex flex-col text-left px-1">
        <span className="mb-1 text-lg font-bold inline-flex items-center">
          <span
            className={classNames(
              "w-3 h-3 mr-2",
              "bg-brand-main/10",
              "rounded-full",
              "flex justify-center items-center"
            )}
          >
            {selected && <span className="bg-radio w-2 h-2 rounded-full" />}
          </span>

          <span>{FEE_MODE_NAMES[value]}</span>
        </span>

        <span className="text-sm text-brand-inactivelight truncate">
          {nativeCurrency && (
            <PrettyAmount
              amount={fee.toString()}
              currency={nativeCurrency.symbol}
              decimals={nativeCurrency.decimals}
            />
          )}
        </span>
      </div>
    </ToggleGroup.Item>
  );
};

type TxAdvancedProps = {
  originTx: Tx;
  overrides: Partial<Tx>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Tx>>>;
};

const TxAdvanced = memo<TxAdvancedProps>(
  ({ originTx: tx, overrides, onOverridesChange }) => {
    const changeValue = useCallback(
      (name: string, value: ethers.BigNumberish | null) => {
        onOverridesChange((o) => ({ ...o, [name]: value }));
      },
      [onOverridesChange]
    );

    const fixValue = useCallback(
      (name: string, value?: string) => {
        if (!value) changeValue(name, null);
      },
      [changeValue]
    );

    return (
      <div className="w-full my-4">
        <NumberInput
          label="Gas Limit"
          placeholder="0"
          thousandSeparator
          decimalScale={0}
          name="gasLimit"
          value={formatUnits(overrides.gasLimit ?? tx.gasLimit)}
          onChange={(e) => changeValue("gasLimit", parseUnits(e.target.value))}
          onBlur={(e) => fixValue("gasLimit", e.target.value)}
          className="w-full mb-4"
        />

        <NumberInput
          label="Nonce"
          placeholder="0"
          thousandSeparator
          decimalScale={0}
          name="nonce"
          value={formatUnits(overrides.nonce ?? tx.nonce)}
          onChange={(e) => changeValue("nonce", parseUnits(e.target.value))}
          onBlur={(e) => fixValue("nonce", e.target.value)}
          className="w-full mb-4"
        />

        <LongTextField
          label="Data"
          readOnly
          value={ethers.utils.hexlify(tx.data ?? "0x00")}
          textareaClassName="!h-36"
        />
      </div>
    );
  }
);

type TxRawProps = {
  tx: Tx;
};

const TxRaw = memo<TxRawProps>(({ tx }) => {
  const rawTx = useMemo(() => ethers.utils.serializeTransaction(tx), [tx]);

  return (
    <div className="w-full mt-4">
      <LongTextField
        label="Raw transaction"
        readOnly
        value={rawTx}
        textareaClassName="!h-48"
      />
    </div>
  );
});

const Loading: FC = () => (
  <div
    className={classNames(
      "h-full flex items-center justify-center",
      "text-white text-lg text-semibold"
    )}
  >
    Loading...
  </div>
);

function bnify(v?: ethers.BigNumberish) {
  return v !== undefined ? ethers.BigNumber.from(v) : undefined;
}

function formatUnits(v?: ethers.BigNumberish, unit: ethers.BigNumberish = 0) {
  if (!v && v !== 0) return "";
  return ethers.utils.formatUnits(v, unit);
}

function parseUnits(v: string, unit: ethers.BigNumberish = 0) {
  try {
    return ethers.utils.parseUnits(v, unit);
  } catch {
    return "";
  }
}
