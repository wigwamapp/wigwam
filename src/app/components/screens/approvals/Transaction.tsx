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
import { createOrganicThrottle } from "lib/system/organicThrottle";

import { TransactionApproval } from "core/types";
import { approveItem } from "core/client";
import { getNextNonce } from "core/common/nonce";

import {
  useChainId,
  useNativeCurrency,
  useOnBlock,
  useProvider,
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

type TabValue = typeof TAB_VALUES[number];
type Tx = ethers.utils.UnsignedTransaction;

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const { accountAddress } = approval;
  const chainId = useChainId();

  const [allAccounts, localNonce] = useAtomValue(
    waitForAll([
      allAccountsAtom,
      getLocalNonceAtom({ chainId, accountAddress }),
    ])
  );

  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts]
  );

  const provider = useProvider();
  const nativeCurrency = useNativeCurrency();

  const [tabValue, setTabValue] = useState<TabValue>("details");
  const [lastError, setLastError] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  const [preparedTx, setPrepatedTx] = useState<Tx>();
  const [txOverrides, setTxOverrides] = useState<Partial<Tx>>({});

  const originTx = useMemo(
    () =>
      preparedTx && {
        ...preparedTx,
        nonce: getNextNonce(preparedTx, localNonce),
      },
    [preparedTx, localNonce]
  );

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

  const averageFee = useMemo(() => {
    if (!finalTx) return null;

    try {
      return ethers.BigNumber.from(finalTx.gasLimit).mul(finalTx.gasPrice!);
    } catch {
      return null;
    }
  }, [finalTx]);

  const withThrottle = useMemo(createOrganicThrottle, []);

  const estimateTx = useCallback(
    () =>
      withThrottle(async () => {
        try {
          let { txParams } = approval;

          if ("gas" in txParams) {
            const { gas, ...rest } = txParams;
            txParams = { ...rest, gasLimit: gas };
          }

          const tx = await provider
            .getUncheckedSigner(account.address)
            .populateTransaction({
              ...txParams,
              type: bnify(txParams?.type)?.toNumber(),
              chainId: bnify(txParams?.chainId)?.toNumber(),
            });
          delete tx.from;

          setPrepatedTx({
            ...tx,
            nonce: bnify(tx.nonce)?.toNumber(),
          });
        } catch (err) {
          console.error(err);
          setLastError(err);
        }
      }),
    [
      withThrottle,
      setPrepatedTx,
      provider,
      account.address,
      approval,
      setLastError,
    ]
  );

  useEffect(() => {
    estimateTx();
  }, [estimateTx]);

  useOnBlock(() => estimateTx());

  useEffect(() => {
    setTabValue(lastError ? "error" : "details");
  }, [setTabValue, lastError]);

  useEffect(() => {
    if (finalTx && averageFee) console.info({ finalTx, averageFee });
  }, [finalTx, averageFee]);

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

  const loading = approving || (!finalTx && !lastError);

  return (
    <ApprovalLayout
      approveText={lastError ? "Retry" : "Approve"}
      onApprove={handleApprove}
      loading={loading}
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
              {averageFee && nativeCurrency && (
                <div className="text-lg text-brand-inactivelight">
                  <span className="">Avarage Fee: </span>
                  <PrettyAmount
                    amount={averageFee.toString()}
                    decimals={nativeCurrency.decimals}
                    currency={nativeCurrency.symbol}
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
  overrides: Partial<Tx>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Tx>>>;
};

const TxFee = memo<TxFeeProps>(
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
      <div className="w-full mt-4">
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

        {tx.maxPriorityFeePerGas ? (
          <>
            <NumberInput
              label="Max priority fee"
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

            <NumberInput
              label="Max fee"
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
      <div className="w-full mt-4">
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
