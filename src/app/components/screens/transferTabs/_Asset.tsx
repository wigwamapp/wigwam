import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Field, Form } from "react-final-form";
import type { FormApi } from "final-form";
import { ethers } from "ethers";
import { useDebouncedCallback } from "use-debounce";
import { ERC20__factory } from "abi-types";
import { createOrganicThrottle } from "lib/system/organicThrottle";
import { useIsMounted } from "lib/react-hooks/useIsMounted";
import { useSafeState } from "lib/react-hooks/useSafeState";
import { Link, navigate } from "lib/navigation";

import { DEFAULT_CHAIN_IDS } from "fixtures/networks";
import { AccountAsset, AccountSource, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";
import { suggestFees, TEvent, trackEvent } from "core/client";

import { Page } from "app/nav";
import {
  composeValidators,
  maxValue,
  required,
  validateAddress,
  withHumanDelay,
  OnChange,
} from "app/utils";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  useChainId,
  useExplorerLink,
  useLazyNetwork,
  useProvider,
} from "app/hooks";
import { useAccountToken } from "app/hooks/tokens";
import { useDialog } from "app/hooks/dialog";
import { useToast } from "app/hooks/toast";
import TokenSelect from "app/components/elements/TokenSelect";
import Button from "app/components/elements/Button";
// import TooltipIcon from "app/components/elements/TooltipIcon";
// import Tooltip from "app/components/elements/Tooltip";
import AssetInput from "app/components/elements/AssetInput";
import FiatAmount from "app/components/elements/FiatAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import InputLabelAction from "app/components/elements/InputLabelAction";
import ContactAutocomplete from "app/components/elements/ContactAutocomplete";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as WarningIcon } from "app/icons/circle-warning.svg";
import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";

const TransferAsset: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom) ?? NATIVE_TOKEN_SLUG;
  const token = useAccountToken<AccountAsset>(tokenSlug);

  const validAsset = !token || token.tokenType === TokenType.Asset;

  useLayoutEffect(() => {
    if (!validAsset) {
      navigate(
        ({ token }) => ({ page: Page.Transfer, transfer: "nft", token }),
        "replace"
      );
    }
  }, [validAsset]);

  return validAsset ? (
    <TransferAssetContent tokenSlug={tokenSlug} asset={token} />
  ) : null;
};

export default TransferAsset;

type FormValues = { amount: string; recipient: string };

const TransferAssetContent = memo<{ tokenSlug: string; asset?: AccountAsset }>(
  ({ tokenSlug, asset }) => {
    const currentAccount = useAtomValue(currentAccountAtom);
    const chainId = useChainId();
    const currentNetwork = useLazyNetwork();
    const explorerLink = useExplorerLink(currentNetwork);
    const setTokenSlug = useSetAtom(tokenSlugAtom);
    const { alert, closeCurrentDialog } = useDialog();
    const { updateToast } = useToast();
    const isMounted = useIsMounted();

    const provider = useProvider();
    const signerProvider = provider.getUncheckedSigner(currentAccount.address);

    const handleSubmit = useCallback(
      async (
        { recipient, amount }: FormValues,
        form: FormApi<FormValues, Partial<FormValues>>
      ) =>
        withHumanDelay(async () => {
          if (!asset) {
            return;
          }

          if (currentAccount.source === AccountSource.Address) {
            return alert({
              title: "Watch-only account",
              content: (
                <span>
                  Cannot create transfer for watch-only wallet.
                  <br />
                  Please change wallet or{" "}
                  <Link
                    to={{ addAccOpened: true }}
                    merge={["tokens"]}
                    className="underline"
                    onClick={closeCurrentDialog}
                  >
                    add new
                  </Link>
                  .
                </span>
              ),
            });
          }

          try {
            const { tokenSlug, decimals } = asset;

            let txParams;

            if (tokenSlug === NATIVE_TOKEN_SLUG) {
              txParams = await provider.populateTransaction({
                to: recipient,
                value: ethers.utils.parseEther(amount),
              });
            } else {
              const tokenContract = parseTokenSlug(tokenSlug).address;
              const contract = ERC20__factory.connect(tokenContract, provider);
              const convertedAmount = ethers.utils.parseUnits(amount, decimals);

              txParams = await contract.populateTransaction.transfer(
                recipient,
                convertedAmount
              );
            }

            const gasLimit = await signerProvider.estimateGas(txParams);

            const txResPromise = signerProvider.sendUncheckedTransaction({
              ...txParams,
              gasLimit,
            });

            const isDefault =
              currentNetwork && DEFAULT_CHAIN_IDS.has(currentNetwork.chainId);
            trackEvent(TEvent.Transfer, {
              networkName: isDefault ? currentNetwork.name : "unknown",
              networkChainId: isDefault ? currentNetwork.chainId : "unknown",
            });
            updateToast(
              <>
                Request for transfer{" "}
                <strong>
                  <PrettyAmount amount={amount} currency={asset.symbol} />
                </strong>{" "}
                successfully created! Please approve it in the opened window.
              </>
            );
            form.restart();

            txResPromise
              .then((txHash) => {
                if (isMounted()) {
                  setTimeout(
                    () => navigate((s) => ({ ...s, page: Page.Default })),
                    50
                  );

                  setTimeout(() => {
                    updateToast(
                      <div className="flex flex-col">
                        <p>
                          <strong>
                            <PrettyAmount
                              amount={amount}
                              currency={asset.symbol}
                            />
                          </strong>{" "}
                          successfully transferred! Confirming...
                        </p>

                        {explorerLink && (
                          <div className="mt-1 flex items-center">
                            <a
                              href={explorerLink.tx(txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              View the transaction in explorer
                            </a>

                            <ExternalLinkIcon className="h-5 w-auto ml-1" />
                          </div>
                        )}
                      </div>
                    );
                  }, 100);
                }
              })
              .catch((err) => {
                console.warn(err);

                if (isMounted()) updateToast(null);
              });
          } catch (err: any) {
            alert({
              title: "Error",
              content: err?.reason || err?.message || "Unknown error.",
            });
          }
        }),
      [
        asset,
        currentAccount.source,
        alert,
        closeCurrentDialog,
        signerProvider,
        currentNetwork,
        updateToast,
        provider,
        isMounted,
        explorerLink,
      ]
    );

    const [recipientAddr, setRecipientAddr] = useSafeState<string>();

    const [estimating, setEstimating] = useSafeState(false);
    const [gas, setGas] = useSafeState<{
      max: ethers.BigNumber;
      average: ethers.BigNumber;
    }>();
    const [estimationError, setEstimationError] = useSafeState<string | null>(
      null
    );

    const maxAmount = useMemo(() => {
      if (asset?.rawBalance) {
        let finalValue = new BigNumber(asset.rawBalance);
        if (tokenSlug === NATIVE_TOKEN_SLUG) {
          finalValue = finalValue.minus(
            new BigNumber(gas ? gas.max.toString() : 0)
          );
        }
        const convertedValue = finalValue
          .div(new BigNumber(10).pow(asset.decimals))
          .decimalPlaces(asset.decimals, BigNumber.ROUND_DOWN);
        if (convertedValue.lt(0)) {
          return "0";
        }
        return convertedValue.toString();
      }
      return "0";
    }, [asset, gas, tokenSlug]);

    const withThrottle = useMemo(createOrganicThrottle, []);

    const assetExist = Boolean(asset);
    const estimateGas = useCallback(
      () =>
        withThrottle(async () => {
          if (recipientAddr && tokenSlug && assetExist) {
            try {
              setEstimating(true);

              const value = 1;
              let gasLimit = ethers.BigNumber.from(0);

              if (tokenSlug === NATIVE_TOKEN_SLUG) {
                gasLimit = await provider.estimateGas({
                  to: recipientAddr,
                  value,
                });
              } else {
                const tokenContract = parseTokenSlug(tokenSlug).address;

                const signer = provider.getUncheckedSigner(
                  currentAccount.address
                );
                const contract = ERC20__factory.connect(tokenContract, signer);

                gasLimit = await contract.estimateGas.transfer(
                  recipientAddr,
                  value
                );
              }

              const fees = await suggestFees(provider);
              if (fees) {
                const gasPrice = fees.modes.high.max;
                const maxGasLimit = gasLimit.mul(3).div(2);

                setGas({
                  average: gasLimit.mul(gasPrice),
                  max: maxGasLimit.mul(gasPrice),
                });
              }

              setEstimationError(null);
            } catch (err) {
              setEstimationError(
                "Estimation failed. Transaction may fail or there network issues"
              );
            } finally {
              setEstimating(false);
            }
          } else {
            setEstimationError(null);
          }
        }),
      [
        withThrottle,
        setEstimating,
        setEstimationError,
        setGas,
        currentAccount.address,
        assetExist,
        provider,
        recipientAddr,
        tokenSlug,
      ]
    );

    const handleRecipientChange = useDebouncedCallback((recipient: string) => {
      if (recipient && ethers.utils.isAddress(recipient)) {
        setRecipientAddr(recipient);
      }
    }, 150);

    useEffect(() => {
      let t: any;

      const performAndDefer = () => {
        estimateGas();
        t = setTimeout(performAndDefer, 10_000);
      };

      performAndDefer();

      return () => clearTimeout(t);
    }, [estimateGas]);

    const formKey = useMemo(
      () => `${currentAccount.address}-${chainId}`,
      [currentAccount.address, chainId]
    );

    const amountFieldKey = useMemo(
      () => `amount-${asset?.tokenSlug}-${maxAmount}`,
      [asset, maxAmount]
    );

    const initialRenderRef = useRef(true);

    useEffect(() => {
      if (initialRenderRef.current) {
        initialRenderRef.current = false;
        return;
      }

      setTokenSlug([RESET, "replace"]);
    }, [setTokenSlug, formKey]);

    if (asset && asset.tokenType !== TokenType.Asset) {
      return null;
    }

    return (
      <Form<FormValues>
        key={formKey}
        onSubmit={handleSubmit}
        render={({ form, handleSubmit, values, submitting }) => (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-w-[23.25rem]"
          >
            <OnChange name="recipient" callback={handleRecipientChange} />
            <TokenSelect
              tokenType={TokenType.Asset}
              handleTokenChanged={() => {
                form.change("amount", "");
                setTimeout(() => form.blur("amount"));
              }}
            />
            <Field
              name="recipient"
              validate={composeValidators(required, validateAddress)}
            >
              {({ input, focus, meta }) => (
                <ContactAutocomplete
                  setValue={(value) => {
                    form.change("recipient", value);
                    focus?.();
                  }}
                  error={meta.error && meta.touched && meta.submitFailed}
                  errorMessage={meta.error}
                  meta={meta}
                  className="mt-5"
                  {...input}
                />
              )}
            </Field>
            <div className="relative mt-5">
              <Field
                key={amountFieldKey}
                name="amount"
                validate={composeValidators(
                  required,
                  maxValue(maxAmount, asset?.symbol)
                )}
              >
                {({ input, meta }) => (
                  <AssetInput
                    label="Amount"
                    placeholder="0.00"
                    thousandSeparator={true}
                    assetDecimals={asset?.decimals}
                    labelActions={
                      estimating ? (
                        <span className="text-xs text-brand-inactivedark2 self-end">
                          Estimating...
                        </span>
                      ) : (
                        <InputLabelAction
                          onClick={() => form.change("amount", maxAmount)}
                        >
                          MAX
                        </InputLabelAction>
                      )
                    }
                    currency={asset ? asset.symbol : undefined}
                    error={(meta.modified || meta.submitFailed) && meta.error}
                    errorMessage={meta.error}
                    readOnly={estimating}
                    {...input}
                  />
                )}
              </Field>
            </div>
            <div className="mt-6 flex items-start">
              <TxCheck
                asset={asset}
                values={{ gas: gas?.average, ...values }}
                error={estimationError}
              />
            </div>
            <Button
              type="submit"
              className="flex items-center min-w-[13.75rem] mt-8 mx-auto"
              loading={submitting}
            >
              <SendIcon className="mr-2" />
              Transfer
            </Button>
          </form>
        )}
      />
    );
  }
);

type TxCheckProps = {
  asset?: AccountAsset;
  values: FormValues & { gas?: ethers.BigNumber };
  error: string | null;
};

const TxCheck = memo<TxCheckProps>(({ asset, values, error }) => {
  const nativeToken = useAccountToken<AccountAsset>(NATIVE_TOKEN_SLUG);

  const tokenUsdAmount = useMemo(
    () =>
      values.amount && asset
        ? new BigNumber(values.amount).multipliedBy(asset.priceUSD ?? 0)
        : new BigNumber(0),
    [asset, values.amount]
  );

  const gas = useMemo(() => {
    const amount =
      values.gas && nativeToken
        ? new BigNumber(values.gas.toString())
        : new BigNumber(0);

    const usdAmount =
      values.gas && nativeToken?.priceUSD
        ? new BigNumber(values.gas.toString())
            .div(new BigNumber(10).pow(nativeToken.decimals))
            .multipliedBy(nativeToken.priceUSD)
        : new BigNumber(0);

    return {
      amount,
      usdAmount,
    };
  }, [nativeToken, values.gas]);

  if (
    nativeToken &&
    (!nativeToken.rawBalance ||
      new BigNumber(nativeToken.rawBalance).lte(0) ||
      new BigNumber(nativeToken.rawBalance).lt((values.gas ?? 0).toString()) ||
      error)
  ) {
    return (
      <div
        className={classNames(
          "w-full",
          "flex items-center",
          "p-4",
          "bg-brand-redobject/[.05]",
          "border border-brand-redobject/[.8]",
          "rounded-[.625rem]",
          "text-sm"
        )}
      >
        <WarningIcon className="mr-2 w-6 h-auto" />
        {error || "Insufficient funds for Network Fee"}
      </div>
    );
  }

  return (
    <>
      {/* <Tooltip
        content={}
        placement="left-start"
        size="large"
        className="mr-2"
      >
        <TooltipIcon />
      </Tooltip> */}
      <div className="ml-4 flex flex-col w-full">
        <SummaryRow
          header="Amount"
          value={
            <PrettyAmount
              amount={values.amount || 0}
              currency={asset?.symbol}
              className="font-semibold"
              copiable
            />
          }
          inBrackets={<FiatAmount amount={tokenUsdAmount} copiable />}
          className="mb-1.5"
        />
        <SummaryRow
          header="Average Fee"
          value={
            <PrettyAmount
              amount={gas.amount}
              currency={nativeToken?.symbol}
              decimals={nativeToken?.decimals}
              copiable
              className="font-semibold"
            />
          }
          inBrackets={<FiatAmount amount={gas.usdAmount} copiable />}
          className="mb-2"
        />
        <hr className="border-brand-main/[.07]" />
        <SummaryRow
          className="mt-2"
          header="Total"
          lightHeader
          value={
            <FiatAmount
              amount={tokenUsdAmount.plus(gas.usdAmount)}
              copiable
              className="font-bold text-lg"
            />
          }
        />
      </div>
    </>
  );
});

type SummaryRowProps = {
  header: ReactNode;
  value: ReactNode;
  lightHeader?: boolean;
  inBrackets?: ReactNode;
  className?: string;
};

const SummaryRow: FC<SummaryRowProps> = ({
  header,
  value,
  lightHeader,
  inBrackets,
  className,
}) => (
  <div
    className={classNames(
      "flex items-center justify-between",
      "text-sm",
      className
    )}
  >
    <h4
      className={classNames(
        "flex-nowrap font-semibold",
        lightHeader ? "text-brand-light" : "text-brand-inactivedark"
      )}
    >
      {header}
    </h4>
    <span className="ml-1 font-semibold">
      {value}
      {inBrackets && (
        <>
          {" "}
          <span className="text-brand-inactivedark font-normal">
            ({inBrackets})
          </span>
        </>
      )}
    </span>
  </div>
);
