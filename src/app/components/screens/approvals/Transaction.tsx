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
import { Transaction, ethers } from "ethers";
import retry from "async-retry";
import * as Tabs from "@radix-ui/react-tabs";
import { createOrganicThrottle } from "lib/system/organicThrottle";

import {
  TransactionApproval,
  TxActionType,
  FeeMode,
  FeeSuggestions,
  AccountSource,
  TxAction,
  TxSignature,
} from "core/types";
import {
  approveItem,
  findToken,
  suggestFees,
  TEvent,
  trackEvent,
} from "core/client";
import { getNextNonce } from "core/common/nonce";
import { isZeroHex, matchTxAction } from "core/common/transaction";
import { estimateL1Fee } from "core/common/l1Fee";

import {
  OverflowProvider,
  useAccounts,
  useChainId,
  useNativeCurrency,
  useOnBlock,
  useProvider,
  useSync,
} from "app/hooks";
import { useLedger } from "app/hooks/ledger";
import { getLocalNonceAtom } from "app/atoms";
import { withHumanDelay } from "app/utils";
import { formatUnits } from "app/utils/txApprove";
import ApprovalHeader from "app/components/blocks/approvals/ApprovalHeader";
import TabsHeader from "app/components/blocks/approvals/TabsHeader";
import FeeTab from "app/components/blocks/approvals/FeeTab";
import AdvancedTab from "app/components/blocks/approvals/AdvancedTab";
import DetailsTab from "app/components/blocks/approvals/DetailsTab";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";

import ApprovalLayout from "./Layout";

const { keccak256, recoverAddress, getAddress } = ethers;

const TAB_VALUES = ["details", "fee", "advanced", "error"] as const;

const TAB_NAMES: Record<TabValue, ReactNode> = {
  details: "Details",
  fee: "Fee",
  advanced: "Advanced",
  error: "Error",
};

type TabValue = (typeof TAB_VALUES)[number];

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const { accountAddress, txParams, source } = approval;
  const chainId = useChainId();
  const { allAccounts } = useAccounts();
  const nativeCurrency = useNativeCurrency();

  const localNonce = useAtomValue(
    getLocalNonceAtom({ chainId, accountAddress }),
  );

  useSync(chainId, accountAddress);

  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts],
  );

  const provider = useProvider();
  const withLedger = useLedger();

  const [tabValue, setTabValue] = useState<TabValue>("details");
  const [feeMode, setFeeMode] = useState<FeeMode>("average");
  const [estimating, setEstimating] = useState(false);
  const [lastError, setLastError] = useState<{
    from: "estimation" | "submit";
    error: any;
  } | null>(null);
  const [approving, setApproving] = useState(false);

  const approvingRef = useRef(approving);
  if (approvingRef.current !== approving) {
    approvingRef.current = approving;
  }

  const [action, setAction] = useState<TxAction | null>(null);
  const [prepared, setPrepared] = useState<{
    tx: Transaction;
    estimatedGasLimit: bigint;
    fees: FeeSuggestions | null;
    l1Fee: bigint | null;
    destinationIsContract: boolean;
  }>();
  const [txOverrides, setTxOverrides] = useState<Partial<Transaction>>({});

  const preparedTx = prepared?.tx;
  const fees = prepared?.fees;
  const l1Fee = prepared?.l1Fee ?? null;

  const originTx = useMemo<Transaction | null>(() => {
    if (!prepared) return null;

    const tx: Transaction = prepared.tx.clone();
    tx.nonce = approval.source?.replaceTx
      ? tx.nonce
      : getNextNonce(tx, localNonce);

    const feeSug = prepared.fees?.modes[feeMode];
    if (feeSug) {
      if (prepared.fees?.type === "modern") {
        tx.maxFeePerGas = feeSug.max;
        if ("priority" in feeSug) {
          tx.maxPriorityFeePerGas = feeSug.priority;
        }
      } else {
        tx.gasPrice = feeSug.max;
      }
    }

    return tx;
  }, [approval.source, prepared, feeMode, localNonce]);

  const finalTx = useMemo<typeof originTx>(() => {
    if (!originTx) return originTx;

    const tx = originTx.clone();

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

      return finalTx.gasLimit * gasPrice! + (l1Fee ?? 0n);
    } catch {
      return null;
    }
  }, [finalTx, l1Fee]);

  const averageFee = useMemo(() => {
    if (!finalTx || !prepared?.estimatedGasLimit) return null;

    try {
      const gasLimit =
        prepared.estimatedGasLimit < finalTx.gasLimit!
          ? prepared.estimatedGasLimit
          : finalTx.gasLimit;
      const gasPrice = finalTx.maxFeePerGas || finalTx.gasPrice;
      return gasLimit * gasPrice! + (l1Fee ?? 0n);
    } catch {
      return null;
    }
  }, [finalTx, l1Fee, prepared?.estimatedGasLimit]);

  const withThrottle = useMemo(createOrganicThrottle, []);

  const estimateTx = useCallback(
    () =>
      withThrottle(async () => {
        if (approvingRef.current) return;

        setEstimating(true);

        try {
          const { gasLimit: providedGasLimit, ...pureTxParams } = txParams;

          // detele tx type cause auto-detect
          delete pureTxParams.type;

          // detele gas prices
          delete pureTxParams.gasPrice;
          delete pureTxParams.maxFeePerGas;
          delete pureTxParams.maxPriorityFeePerGas;

          // Fetch fee data
          const feeSuggestions = await suggestFees(provider).catch(() => null);

          const [tx, destinationIsContract] = await Promise.all([
            // Prepare transaction with other fields
            retry(
              () =>
                provider.getVoidSigner(account.address).populateTransaction({
                  ...pureTxParams,
                  nonce: pureTxParams.nonce ? +pureTxParams.nonce : undefined,
                  type: feeSuggestions?.type === "legacy" ? 0 : undefined,
                  // ...(feeSuggestions?.type === "modern"
                  //   ? {
                  //       maxFeePerGas: feeSuggestions.modes.low.max,
                  //       maxPriorityFeePerGas: feeSuggestions.modes.low.priority,
                  //     }
                  //   : feeSuggestions?.type === "legacy"
                  //     ? {
                  //         gasPrice: feeSuggestions.modes.average.max,
                  //       }
                  //     : {}),
                }),
              { retries: 2, minTimeout: 0, maxTimeout: 0 },
            ),
            false,
            // TODO: Add logic for this
            // Check is destination is smart contract
            // txParams.to
            //   ? isSmartContractAddress(provider, txParams.to)
            //   : false,
          ]);

          delete tx.from;

          const estimatedGasLimit = BigInt(
            feeSuggestions?.gasLimit ?? tx.gasLimit!,
          );
          const minGasLimit = (estimatedGasLimit * 5n) / 4n;
          const averageGasLimit = (estimatedGasLimit * 3n) / 2n;
          let gasLimit =
            providedGasLimit && minGasLimit <= BigInt(providedGasLimit)
              ? BigInt(providedGasLimit)
              : averageGasLimit;

          if (isZeroHex(tx.data)) {
            gasLimit = 21_000n;
          }

          const preparedTx = Transaction.from({
            ...tx,
            gasLimit,
          });

          const l1GasFee = await estimateL1Fee(
            provider,
            preparedTx,
            feeSuggestions?.modes.average.max,
          );

          setLastError((le) => (le?.from === "estimation" ? null : le));
          setPrepared({
            tx: preparedTx,
            estimatedGasLimit,
            fees: feeSuggestions,
            l1Fee: l1GasFee,
            destinationIsContract,
          });

          try {
            if (
              approval.source?.replaceTx?.type === "speedup" &&
              approval.source.replaceTx.prevTxGasPrice &&
              feeSuggestions
            ) {
              const prevTxGasPrice = BigInt(
                approval.source.replaceTx.prevTxGasPrice,
              );
              const gasPrice = (prevTxGasPrice * 11n) / 10n + 1n; // Add 10%

              if (gasPrice < feeSuggestions.modes.average.max) {
                setFeeMode("average");
              } else {
                setTxOverrides(
                  tx.maxFeePerGas ? { maxFeePerGas: gasPrice } : { gasPrice },
                );
              }
            }
          } catch (err) {
            console.error("Failed to increase fee", err);
          }
        } catch (err) {
          console.error(err);
          setLastError({ from: "estimation", error: err });
        }

        setEstimating(false);
      }),
    [
      withThrottle,
      setEstimating,
      setPrepared,
      setLastError,
      setTxOverrides,
      setFeeMode,
      provider,
      account.address,
      txParams,
      approval,
    ],
  );

  useEffect(() => {
    matchTxAction(provider, txParams)
      .then((a) => a && setAction(a))
      .catch(console.warn);
  }, [provider, txParams]);

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

      default:
        return;
    }
  }, [action, chainId, accountAddress]);

  if (process.env.RELEASE_ENV === "false") {
    // eslint-disable-next-line
    useEffect(() => {
      console.info("action", action);
    }, [action]);

    // eslint-disable-next-line
    useEffect(() => {
      if (preparedTx && finalTx) {
        console.info({ preparedTx, finalTx });

        if (fees) {
          const { low, average, high } = fees.modes;
          console.info(
            "f",
            [low, average, high].map((m) => formatUnits(m.max, "gwei")),
          );
        }
      }
    }, [preparedTx, fees, finalTx]);
  }

  useEffect(() => {
    if (lastError) console.info(Object.values(lastError));
  }, [lastError]);

  const handleApprove = useCallback(
    async (approved: boolean) => {
      setLastError(null);
      setApproving(true);

      try {
        await withHumanDelay(async () => {
          if (!approved) {
            await approveItem(approval.id, { approved });
            return;
          }

          if (!finalTx) {
            if (lastError) throw lastError.error;
            return;
          }

          const gasBalance = await provider.getBalance(account.address);
          const totalGas =
            finalTx.gasLimit * (finalTx.maxFeePerGas ?? finalTx.gasPrice!) +
            (finalTx.value ?? 0n);

          if (gasBalance < totalGas) {
            throw new Error(
              `Not enough ${
                nativeCurrency?.symbol
                  ? `${nativeCurrency.symbol} token balance`
                  : "funds"
              } to cover the network (gas) fee. Or the transaction may require a manual fee and a "gas limit" setting.`,
            );
          }

          console.info({ finalTx });

          const rawTx = Transaction.from(finalTx).unsignedSerialized;

          if (account.source !== AccountSource.Ledger) {
            await approveItem(approval.id, { approved, rawTx });
          } else {
            let signature: TxSignature | undefined;
            let ledgerError: any;

            await withLedger(async ({ ledgerEth }) => {
              try {
                const sig = await ledgerEth.signTransaction(
                  account.derivationPath,
                  rawTx.substring(2),
                );

                const formattedSig = {
                  v: Number("0x" + sig.v),
                  r: "0x" + sig.r,
                  s: "0x" + sig.s,
                };

                const digest = keccak256(rawTx);
                const addressSignedWith = recoverAddress(digest, formattedSig);
                if (
                  getAddress(addressSignedWith) !== getAddress(account.address)
                ) {
                  throw new Error(
                    "Ledger: The signature doesnt match the right address",
                  );
                }

                signature = formattedSig;
              } catch (err) {
                ledgerError = err;
              }
            });

            if (signature) {
              await approveItem(approval.id, { approved, rawTx, signature });
            } else {
              throw (
                ledgerError ??
                new Error("Failed to sign transaction with Ledger")
              );
            }
          }
        });
      } catch (err) {
        console.error(err);
        setLastError({ from: "submit", error: err });
      } finally {
        setApproving(false);
      }
    },
    [
      approval,
      account,
      lastError,
      setLastError,
      setApproving,
      finalTx,
      provider,
      withLedger,
      nativeCurrency,
    ],
  );

  const lastErrorMessage = useMemo(() => {
    if (!lastError?.error) return null;

    const originMsg =
      lastError?.error.reason || lastError?.error.message || "Unknown error.";

    switch (originMsg.toLowerCase()) {
      case "insufficient funds for transfer":
        return (
          <>
            Insufficient {nativeCurrency?.symbol} for transaction (gas) fee.
            Check your account balance. Use Buy or Swap feature to add more if
            necessary.
          </>
        );

      case "execution reverted":
        return (
          <>
            Failed to execute the transaction. The smart contract couldn&apos;t
            process your request. Please review the parameters.
          </>
        );

      default:
        return originMsg;
    }
  }, [lastError, nativeCurrency]);

  const bootAnimationRef = useRef(true);
  const handleBootAnimationDone = useCallback(() => {
    bootAnimationRef.current = false;
  }, []);

  useEffect(() => {
    trackEvent(TEvent.DappTransaction, { source: source.type });
  }, [source.type]);

  return (
    <ApprovalLayout
      approveText={lastError?.from === "submit" ? "Retry" : "Approve"}
      onApprove={handleApprove}
      disabled={estimating}
      approving={approving}
      className="!pt-7"
    >
      <ApprovalHeader account={account} source={source} />

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
          withError={Boolean(lastError)}
          oneSuccess={Boolean(prepared)}
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
                {fees && originTx && action ? (
                  <div
                    className={classNames(
                      "w-full",
                      bootAnimationRef.current && "animate-bootfadeinfast",
                    )}
                    onAnimationEnd={handleBootAnimationDone}
                  >
                    <DetailsTab
                      accountAddress={accountAddress}
                      fees={fees}
                      l1Fee={l1Fee}
                      averageGasLimit={prepared.estimatedGasLimit}
                      gasLimit={txOverrides.gasLimit || originTx.gasLimit!}
                      feeMode={feeMode}
                      maxFee={maxFee}
                      averageFee={averageFee}
                      action={action}
                      source={source}
                      onFeeButtonClick={() => setTabValue("fee")}
                    />
                  </div>
                ) : (
                  <Loading />
                )}
              </Tabs.Content>

              <Tabs.Content value="fee">
                {originTx ? (
                  <FeeTab
                    accountAddress={accountAddress}
                    originTx={originTx}
                    fees={fees ?? null}
                    l1Fee={l1Fee}
                    averageGasLimit={prepared?.estimatedGasLimit ?? null}
                    feeMode={feeMode}
                    setFeeMode={setFeeMode}
                    maxFee={maxFee}
                    averageFee={averageFee}
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
                {lastErrorMessage && (
                  <div
                    className={classNames(
                      "w-full h-48",
                      "py-3 px-4",
                      "box-border border border-brand-main/10",
                      "bg-black/10 rounded-[.625rem]",
                      "text-base leading-5 text-brand-light font-medium",
                      "transition-colors",
                    )}
                  >
                    {lastErrorMessage}
                  </div>
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

const Loading: FC = () => {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDelayed(true), 150);
    return () => clearTimeout(t);
  }, [setDelayed]);

  return (
    <div
      className={classNames(
        !delayed ? "hidden" : "animate-bootfadeinfast",
        "min-h-[200px] flex items-center justify-center",
        "text-white text-lg text-semibold",
      )}
    >
      <div className="atom-spinner w-12 h-12" />
    </div>
  );
};
