import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { ethers } from "ethers";
import useForceUpdate from "use-force-update";
import * as Tabs from "@radix-ui/react-tabs";
import { createQueue } from "lib/system/queue";

import { TransactionApproval } from "core/types";
import { allAccountsAtom } from "app/atoms";
import { approveItem } from "core/client";

import { useProvider } from "app/hooks";
import WalletCard from "app/components/elements/WalletCard";
import NumberInput from "app/components/elements/NumberInput";
import LongTextField from "app/components/elements/LongTextField";

import ApprovalLayout from "./Layout";

const TAB_VALUES = ["summary", "fee", "data", "hash", "error"] as const;

const TAB_NAMES: Record<TabValue, ReactNode> = {
  summary: "Summary",
  fee: "Fee",
  data: "Data",
  hash: "Hash",
  error: "Error",
};

type TabValue = typeof TAB_VALUES[number];

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const allAccounts = useAtomValue(allAccountsAtom);
  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts]
  );

  const provider = useProvider().getUncheckedSigner(account.address);

  const forceUpdate = useForceUpdate();

  const preparedTxRef = useRef<ethers.utils.UnsignedTransaction>();
  const [tabValue, setTabValue] = useState<TabValue>("summary");
  const [lastError, setLastError] = useState<any>(null);

  const enqueueEstimate = useMemo(createQueue, []);

  const estimateTx = useCallback(
    () =>
      enqueueEstimate(async () => {
        try {
          let { txParams } = approval;

          if ("gas" in txParams) {
            const { gas, ...rest } = txParams;
            txParams = { ...rest, gasLimit: gas };
          }

          const tx = await provider.populateTransaction({
            ...txParams,
            type: hexToNum(txParams?.type),
            chainId: hexToNum(txParams?.chainId),
          });

          console.info(tx.gasLimit?.toString());

          preparedTxRef.current = {
            ...tx,
            nonce: hexToNum(tx.nonce),
          };
          forceUpdate();
        } catch (err) {
          console.error(err);
          setLastError(err);
        }
      }),
    [enqueueEstimate, forceUpdate, provider, approval, setLastError]
  );

  useEffect(() => {
    estimateTx();
  }, [estimateTx]);

  useEffect(() => {
    setTabValue(lastError ? "error" : "summary");
  }, [setTabValue, lastError]);

  const preparedTx = preparedTxRef.current;

  const handleApprove = useCallback(
    async (approved: boolean) => {
      if (!preparedTx) return;

      setLastError(null);

      try {
        const rawTx = ethers.utils.serializeTransaction(preparedTx);

        await approveItem(approval.id, { approved, rawTx });
      } catch (err) {
        console.error(err);
        setLastError(err);
      }
    },
    [approval, setLastError, preparedTx]
  );

  const loading = !preparedTx && !lastError;

  return (
    <ApprovalLayout
      approveText={lastError ? "Retry" : "Approve"}
      onApprove={handleApprove}
      loading={loading}
    >
      <WalletCard account={account} />

      <Tabs.Root
        defaultValue="summary"
        orientation="horizontal"
        value={tabValue}
        onValueChange={(v) => setTabValue(v as TabValue)}
        className="mt-6 w-full flex flex-col"
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

        <div className="mt-4">
          <Tabs.Content value="summary">Transaction summary</Tabs.Content>

          <Tabs.Content value="fee">
            {!preparedTx ? (
              <Loading />
            ) : (
              <div className="w-full p-4">
                <NumberInput
                  label="Gas Limit"
                  placeholder="0"
                  thousandSeparator
                  decimalScale={0}
                  defaultValue={formatUnits(preparedTx.gasLimit)}
                  className="w-full mb-4"
                />

                <NumberInput
                  label="Max priority fee"
                  placeholder="0.00"
                  thousandSeparator
                  decimalScale={9}
                  defaultValue={formatUnits(
                    preparedTx.maxPriorityFeePerGas,
                    "gwei"
                  )}
                  className="w-full mb-4"
                />

                <NumberInput
                  label="Max fee"
                  placeholder="0.00"
                  thousandSeparator
                  decimalScale={9}
                  defaultValue={formatUnits(preparedTx.maxFeePerGas, "gwei")}
                  className="w-full mb-4"
                />
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="data">Transaction Data</Tabs.Content>

          <Tabs.Content value="hash">Transaction Hash</Tabs.Content>

          <Tabs.Content value="error">
            {lastError && (
              <LongTextField
                readOnly
                value={lastError?.message || "Unknown error."}
              />
            )}
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </ApprovalLayout>
  );
};

export default ApproveTransaction;

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

function hexToNum(v?: ethers.BigNumberish) {
  return v !== undefined ? ethers.BigNumber.from(v).toNumber() : undefined;
}

function formatUnits(v?: ethers.BigNumberish, unit: ethers.BigNumberish = 0) {
  if (v === undefined) return v;
  return ethers.utils.formatUnits(v, unit);
}
