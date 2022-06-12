import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import * as Tabs from "@radix-ui/react-tabs";
import { createOrganicThrottle } from "lib/system/organicThrottle";

import {
  TransactionApproval,
  TxActionType,
  FeeMode,
  FeeSuggestions,
} from "core/types";
import { approveItem, findToken, suggestFees } from "core/client";
import { getNextNonce } from "core/common/nonce";
import { isSmartContractAddress, matchTxAction } from "core/common/transaction";

import {
  OverflowProvider,
  useChainId,
  useOnBlock,
  useProvider,
  useSync,
} from "app/hooks";
import { allAccountsAtom, getLocalNonceAtom } from "app/atoms";
import { withHumanDelay } from "app/utils";
import TransactionHeader from "app/components/blocks/approvals/TransactionHeader";
import TabsHeader from "app/components/blocks/approvals/TabsHeader";
import FeeTab from "app/components/blocks/approvals/FeeTab";
import AdvancedTab from "app/components/blocks/approvals/AdvancedTab";
import DetailsTab from "app/components/blocks/approvals/DetailsTab";
import LongTextField from "app/components/elements/LongTextField";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";

import ApprovalLayout from "./Layout";

const TAB_VALUES = ["details", "fee", "advanced", "error"] as const;

const TAB_NAMES: Record<TabValue, ReactNode> = {
  details: "Details",
  fee: "Fee",
  advanced: "Advanced",
  error: "Error",
};

export const FEE_MODE_NAMES: Record<
  FeeMode,
  { icon: ReactNode; name: ReactNode }
> = {
  low: { icon: "🐌", name: "Eco" },
  average: { icon: "🥑", name: "Market" },
  high: { icon: "💨", name: "ASAP" },
};

type TabValue = typeof TAB_VALUES[number];
export type Tx = ethers.utils.UnsignedTransaction;

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const { accountAddress, txParams, source } = approval;
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
        if (approving) return;

        setEstimating(true);

        try {
          const { gasLimit, ...rest } = txParams;

          const [tx, feeSuggestions, destinationIsContract] = await Promise.all(
            [
              // Prepare transaction with other fields
              provider.getUncheckedSigner(account.address).populateTransaction({
                ...rest,
                type: bnify(rest?.type)?.toNumber(),
                chainId: bnify(rest?.chainId)?.toNumber(),
              }),
              // Fetch fee data
              suggestFees(provider).catch(() => null),
              // Check is destination is smart contract
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
      setLastError,
      approving,
      provider,
      account.address,
      txParams,
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
      className="!pt-7"
    >
      <TransactionHeader account={account} action={action} source={source} />

      <Tabs.Root
        defaultValue="details"
        orientation="horizontal"
        value={tabValue}
        onValueChange={(v) => setTabValue(v as TabValue)}
        className="mt-5 w-full flex flex-col min-h-0"
      >
        <TabsHeader
          aria-label="Approve tabs"
          values={TAB_VALUES}
          currentValue={tabValue}
          names={TAB_NAMES}
          withError={lastError}
        />

        <OverflowProvider>
          {(ref) => (
            <ScrollAreaContainer
              ref={ref}
              className="w-full box-content -mr-5 pr-5"
              viewPortClassName="viewportBlock pt-5"
              scrollBarClassName="pt-5 pb-0"
            >
              <Tabs.Content value="details">
                {fees && originTx && action && (
                  <DetailsTab
                    accountAddress={accountAddress}
                    fees={fees}
                    gasLimit={ethers.BigNumber.from(
                      txOverrides.gasLimit ?? originTx.gasLimit!
                    )}
                    feeMode={feeMode}
                    maxFee={maxFee}
                    action={action}
                    source={source}
                    onFeeButtonClick={() => setTabValue("fee")}
                  />
                )}
              </Tabs.Content>

              <Tabs.Content value="fee">
                {originTx ? (
                  <FeeTab
                    accountAddress={accountAddress}
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
                {originTx && finalTx ? (
                  <AdvancedTab
                    originTx={originTx}
                    finalTx={finalTx}
                    overrides={txOverrides}
                    onOverridesChange={setTxOverrides}
                  />
                ) : (
                  <Loading />
                )}
              </Tabs.Content>

              <Tabs.Content value="error">
                {lastError && (
                  <LongTextField
                    readOnly
                    value={lastError?.message || "Unknown error."}
                  />
                )}
              </Tabs.Content>
            </ScrollAreaContainer>
          )}
        </OverflowProvider>
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

function bnify(v?: ethers.BigNumberish) {
  return v !== undefined ? ethers.BigNumber.from(v) : undefined;
}

export function formatUnits(
  v?: ethers.BigNumberish,
  unit: ethers.BigNumberish = 0
) {
  if (!v && v !== 0) return "";
  return ethers.utils.formatUnits(v, unit);
}

export function parseUnits(v: string, unit: ethers.BigNumberish = 0) {
  try {
    return ethers.utils.parseUnits(v, unit);
  } catch {
    return "";
  }
}

export const prepareAmountOnChange = ({
  value,
  decimals = 9,
  operator = "plus",
}: {
  value: BigNumber.Value;
  decimals?: number;
  operator?: "plus" | "minus";
}) => {
  const preparedValue = new BigNumber(value);
  const valueToChange = new BigNumber(1).multipliedBy(
    new BigNumber(10).pow(decimals)
  );
  const finalValue = preparedValue[operator](valueToChange);

  return finalValue.gt(0) ? ethers.BigNumber.from(finalValue.toString()) : 0;
};
