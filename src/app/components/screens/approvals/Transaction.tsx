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
import { ethers } from "ethers";
import * as Tabs from "@radix-ui/react-tabs";
import { createOrganicThrottle } from "lib/system/organicThrottle";

import { TransactionApproval } from "core/types";
import { allAccountsAtom } from "app/atoms";
import { approveItem } from "core/client";

import { useNativeCurrency, useOnBlock, useProvider } from "app/hooks";
import WalletCard from "app/components/elements/WalletCard";
import NumberInput from "app/components/elements/NumberInput";
import LongTextField from "app/components/elements/LongTextField";
import NetworkPreview from "app/components/elements/NetworkPreview";

import ApprovalLayout from "./Layout";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { withHumanDelay } from "app/utils";
import PrettyAmount from "app/components/elements/PrettyAmount";

const TAB_VALUES = ["summary", "fee", "data", "raw", "error"] as const;

const TAB_NAMES: Record<TabValue, ReactNode> = {
  summary: "Summary",
  fee: "Fee",
  data: "Data",
  raw: "Raw",
  error: "Error",
};

type TabValue = typeof TAB_VALUES[number];
type Tx = ethers.utils.UnsignedTransaction;

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const allAccounts = useAtomValue(allAccountsAtom);
  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts]
  );

  const provider = useProvider();
  const nativeCurrency = useNativeCurrency();

  const [tabValue, setTabValue] = useState<TabValue>("summary");
  const [lastError, setLastError] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  const [preparedTx, setPreparedTx] = useState<Tx>();
  const [txOverrides, setTxOverrides] = useState<Partial<Tx>>({});

  const finalTx = useMemo<typeof preparedTx>(() => {
    if (!preparedTx) return preparedTx;

    const tx = { ...preparedTx };
    for (const [key, value] of Object.entries(txOverrides)) {
      if (value || value === 0) {
        (tx as any)[key] = value;
      }
    }

    return tx;
  }, [preparedTx, txOverrides]);

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

          setPreparedTx({
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
      setPreparedTx,
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
    setTabValue(lastError ? "error" : "summary");
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
          defaultValue="summary"
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

          <Tabs.Content value="summary">
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
            {preparedTx ? (
              <TxFee
                tx={preparedTx}
                overrides={txOverrides}
                onOverridesChange={setTxOverrides}
              />
            ) : (
              <Loading />
            )}
          </Tabs.Content>

          <Tabs.Content value="data">
            {finalTx ? <TxData tx={finalTx} /> : <Loading />}
          </Tabs.Content>

          <Tabs.Content value="raw">
            {finalTx ? <TxSign tx={finalTx} /> : <Loading />}
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
  tx: Tx;
  overrides: Partial<Tx>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Tx>>>;
};

const TxFee = memo<TxFeeProps>(({ tx, overrides, onOverridesChange }) => {
  const gasLimit = overrides.gasLimit ?? tx.gasLimit;
  const maxPriorityFeePerGas =
    overrides.maxPriorityFeePerGas ?? tx.maxPriorityFeePerGas;
  const maxFeePerGas = overrides.maxFeePerGas ?? tx.maxFeePerGas;
  const gasPrice = overrides.gasPrice ?? tx.gasPrice;

  const changeValue = useCallback(
    (name: string, value: ethers.BigNumberish | null) => {
      onOverridesChange((o) => ({ ...o, [name]: value }));
    },
    [onOverridesChange]
  );

  const fixValue = useCallback(
    (name: string, value?: string) => {
      if (!value) {
        onOverridesChange((o) => ({ ...o, [name]: null }));
      }
    },
    [onOverridesChange]
  );

  return (
    <div className="w-full mt-4">
      <NumberInput
        label="Gas Limit"
        placeholder="0"
        thousandSeparator
        decimalScale={0}
        name="gasLimit"
        value={formatUnits(gasLimit)}
        onChange={(e) => changeValue("gasLimit", parseUnits(e.target.value))}
        onBlur={(e) => fixValue("gasLimit", e.target.value)}
        className="w-full mb-4"
      />

      {maxPriorityFeePerGas ? (
        <>
          <NumberInput
            label="Max priority fee"
            placeholder="0.00"
            thousandSeparator
            decimalScale={9}
            value={formatUnits(maxPriorityFeePerGas, "gwei")}
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
            value={formatUnits(maxFeePerGas, "gwei")}
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
            value={formatUnits(gasPrice, "gwei")}
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
});

type TxDataProps = {
  tx: Tx;
};

const TxData = memo<TxDataProps>(({ tx }) => {
  return (
    <div className="w-full mt-4">
      <LongTextField
        label="Data"
        readOnly
        value={ethers.utils.hexlify(tx.data ?? "0x00")}
        textareaClassName="!h-36"
      />
    </div>
  );
});

type TxSignProps = {
  tx: Tx;
};

const TxSign = memo<TxSignProps>(({ tx }) => {
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
