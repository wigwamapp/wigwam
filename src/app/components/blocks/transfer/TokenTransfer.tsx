import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Field, Form } from "react-final-form";
import type { FormApi } from "final-form";
import { ethers } from "ethers";
import { useDebouncedCallback } from "use-debounce";
import { ERC1155__factory, ERC20__factory, ERC721__factory } from "abi-types";
import { createOrganicThrottle } from "lib/system/organicThrottle";
import { useIsMounted } from "lib/react-hooks/useIsMounted";
import { useSafeState } from "lib/react-hooks/useSafeState";
import { Link, navigate, Redirect } from "lib/navigation";

import { DEFAULT_CHAIN_IDS } from "fixtures/networks";
import {
  AccountAsset,
  AccountSource,
  AccountToken,
  TokenStandard,
  TokenType,
} from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";
import { requestBalance } from "core/common/balance";
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
import { tokenSlugAtom, tokenTypeAtom } from "app/atoms";
import {
  useAccounts,
  useChainId,
  useExplorerLink,
  useLazyNetwork,
  useProvider,
  useSync,
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

const TransferToken: FC<{ tokenType: TokenType }> = ({ tokenType }) => {
  const tokenSlug = useAtomValue(tokenSlugAtom) ?? NATIVE_TOKEN_SLUG;
  let token = useAccountToken(tokenSlug);

  if (tokenType === TokenType.NFT && token?.tokenSlug === NATIVE_TOKEN_SLUG) {
    token = undefined;
  }

  const validTokenType = !token || token.tokenType === tokenType;

  return validTokenType ? (
    <TransferTokenContent
      tokenType={tokenType}
      tokenSlug={tokenSlug}
      token={token}
    />
  ) : (
    <Redirect
      to={{
        page: Page.Transfer,
        transfer: tokenType === TokenType.Asset ? "nft" : "asset",
      }}
      merge={["token"]}
    />
  );
};

export default TransferToken;

type FormValues = { amount: string; recipient: string };

type TransferTokenContent = {
  tokenType: TokenType;
  tokenSlug: string;
  token?: AccountToken;
};

const TransferTokenContent = memo<TransferTokenContent>(
  ({ tokenType, tokenSlug, token }) => {
    const { currentAccount } = useAccounts();
    const chainId = useChainId();
    const currentNetwork = useLazyNetwork();
    const explorerLink = useExplorerLink(currentNetwork);
    const setTokenType = useSetAtom(tokenTypeAtom);
    const setTokenSlug = useSetAtom(tokenSlugAtom);
    const { alert, closeCurrentDialog } = useDialog();
    const { updateToast } = useToast();
    const isMounted = useIsMounted();

    const provider = useProvider();
    const signerProvider = provider.getVoidSigner(currentAccount.address);

    useSync(chainId, currentAccount.address, tokenType);

    const handleSubmit = useCallback(
      async (
        { recipient, amount }: FormValues,
        form: FormApi<FormValues, Partial<FormValues>>,
      ) =>
        withHumanDelay(async () => {
          if (!token) {
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
            let txParams: ethers.TransactionRequest;

            if (token.tokenSlug === NATIVE_TOKEN_SLUG) {
              txParams = await provider.populateTransaction({
                to: recipient,
                value: ethers.parseEther(amount),
              });
            } else {
              const rawAmount =
                "decimals" in token && token.decimals > 0
                  ? ethers.parseUnits(amount, token.decimals)
                  : amount;

              const { standard, address, id } = parseTokenSlug(token.tokenSlug);

              switch (standard) {
                case TokenStandard.ERC20:
                  {
                    const contract = ERC20__factory.connect(address, provider);

                    txParams = await contract.transfer.populateTransaction(
                      recipient,
                      rawAmount,
                    );
                  }
                  break;

                case TokenStandard.ERC721:
                  {
                    const contract = ERC721__factory.connect(address, provider);

                    txParams = await contract.transferFrom.populateTransaction(
                      currentAccount.address,
                      recipient,
                      id,
                    );
                  }
                  break;

                case TokenStandard.ERC1155:
                  {
                    const contract = ERC1155__factory.connect(
                      address,
                      provider,
                    );

                    txParams =
                      await contract.safeTransferFrom.populateTransaction(
                        currentAccount.address,
                        recipient,
                        id,
                        rawAmount,
                        new Uint8Array(),
                      );
                  }
                  break;

                default:
                  throw new Error("Unhandled Token ERC standard");
              }
            }

            const gasLimit = await signerProvider.estimateGas(txParams);
            const rpcTx = provider.getRpcTransaction({
              ...txParams,
              from: currentAccount.address,
              gasLimit,
            });

            const txResPromise = provider.send("eth_sendTransaction", [rpcTx]);

            const isDefault =
              currentNetwork && DEFAULT_CHAIN_IDS.has(currentNetwork.chainId);
            trackEvent(TEvent.Transfer, {
              networkName: isDefault ? currentNetwork.name : "unknown",
              networkChainId: isDefault ? currentNetwork.chainId : "unknown",
            });

            const tokenPreview =
              token.tokenType === TokenType.Asset ? (
                <PrettyAmount
                  amount={amount?.toString()}
                  currency={token.symbol}
                />
              ) : (
                token.name
              );

            updateToast(
              <>
                Request for transfer <strong>{tokenPreview}</strong>{" "}
                successfully created! Please approve it in the opened window.
              </>,
            );
            form.restart();

            txResPromise
              .then((txHash) => {
                if (isMounted()) {
                  setTokenType(token.tokenType);

                  setTimeout(
                    () => navigate((s) => ({ ...s, page: Page.Default })),
                    50,
                  );

                  setTimeout(() => {
                    updateToast(
                      <div className="flex flex-col">
                        <p>
                          <strong>{tokenPreview}</strong> successfully
                          transferred! Confirming...
                        </p>

                        {explorerLink && (
                          <a
                            href={explorerLink.tx(txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 underline"
                          >
                            View the transaction in{" "}
                            <span className="whitespace-nowrap">
                              explorer
                              <ExternalLinkIcon className="h-5 w-auto ml-1 inline-block" />
                            </span>
                          </a>
                        )}
                      </div>,
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
        token,
        currentAccount.source,
        currentAccount.address,
        alert,
        closeCurrentDialog,
        signerProvider,
        currentNetwork,
        updateToast,
        provider,
        isMounted,
        setTokenType,
        explorerLink,
      ],
    );

    const [recipientAddr, setRecipientAddr] = useSafeState<string>();

    const [estimating, setEstimating] = useSafeState(false);
    const [gas, setGas] = useSafeState<{
      max: bigint;
      average: bigint;
      rawBalance: bigint | null;
    }>();
    const [estimationError, setEstimationError] = useSafeState<string | null>(
      null,
    );

    const maxAmount = useMemo(() => {
      if (!token) return "0";

      const rawBalance = gas?.rawBalance?.toString() ?? token.rawBalance;
      if (!rawBalance) return "0";

      let value = new BigNumber(rawBalance);

      if (token.tokenSlug === NATIVE_TOKEN_SLUG) {
        value = value.minus(new BigNumber(gas ? gas.max.toString() : 0));
      }

      if (token?.tokenType === TokenType.Asset) {
        value = value
          .div(new BigNumber(10).pow(token.decimals.toString()))
          .decimalPlaces(Number(token.decimals), BigNumber.ROUND_DOWN);
      }

      if (value.lt(0)) {
        return "0";
      }

      return value.toString();
    }, [token, gas]);

    const withThrottle = useMemo(createOrganicThrottle, []);

    const tokenExist = Boolean(token);
    const estimateGas = useCallback(
      () =>
        withThrottle(async () => {
          if (recipientAddr && tokenSlug && tokenExist) {
            try {
              setEstimating(true);

              const value = 1;
              let gasLimit = 0n;

              if (tokenSlug === NATIVE_TOKEN_SLUG) {
                gasLimit = await provider.estimateGas({
                  to: recipientAddr,
                  value,
                });
              } else {
                const { standard, address, id } = parseTokenSlug(tokenSlug);

                const signer = provider.getVoidSigner(currentAccount.address);

                switch (standard) {
                  case TokenStandard.ERC20:
                    {
                      const contract = ERC20__factory.connect(address, signer);

                      gasLimit = await contract.transfer.estimateGas(
                        recipientAddr,
                        value,
                      );
                    }
                    break;

                  case TokenStandard.ERC721:
                    {
                      const contract = ERC721__factory.connect(address, signer);

                      gasLimit = await contract.transferFrom.estimateGas(
                        currentAccount.address,
                        recipientAddr,
                        id,
                      );
                    }
                    break;

                  case TokenStandard.ERC1155:
                    {
                      const contract = ERC1155__factory.connect(
                        address,
                        signer,
                      );

                      gasLimit = await contract.safeTransferFrom.estimateGas(
                        currentAccount.address,
                        recipientAddr,
                        id,
                        value,
                        new Uint8Array(),
                      );
                    }
                    break;

                  default:
                    throw new Error("Unhandled Token ERC standard");
                }
              }

              const fees = await suggestFees(provider);

              const gasPrice = fees.modes.high.max;
              const maxGasLimit = (gasLimit * 3n) / 2n;
              const rawBalance = await requestBalance(
                provider,
                tokenSlug,
                currentAccount.address,
              );

              setGas({
                average: gasLimit * gasPrice,
                max: maxGasLimit * gasPrice,
                rawBalance,
              });

              setEstimationError(null);
            } catch (err) {
              console.warn(err);

              setGas(undefined);
              setEstimationError(
                "Estimation failed. Transaction may fail or there network issues",
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
        tokenExist,
        provider,
        recipientAddr,
        tokenSlug,
      ],
    );

    const handleRecipientChange = useDebouncedCallback((recipient: string) => {
      if (recipient && ethers.isAddress(recipient)) {
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
      [currentAccount.address, chainId],
    );

    const amountFieldKey = useMemo(
      () => `amount-${token?.tokenSlug}-${maxAmount}`,
      [token, maxAmount],
    );

    const initialRenderRef = useRef(true);

    useEffect(() => {
      if (initialRenderRef.current) {
        initialRenderRef.current = false;
        return;
      }

      setTokenSlug([RESET, "replace"]);
    }, [setTokenSlug, formKey]);

    const tokenSymbol =
      token?.tokenType === TokenType.Asset ? token.symbol : undefined;
    const tokenDecimals =
      token?.tokenType === TokenType.Asset ? token.decimals : 0;

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
              tokenType={tokenType}
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
            {parseTokenSlug(tokenSlug).standard !== TokenStandard.ERC721 && (
              <div className="relative mt-5">
                <Field
                  key={amountFieldKey}
                  name="amount"
                  validate={composeValidators(
                    required,
                    maxValue(maxAmount, tokenSymbol),
                  )}
                >
                  {({ input, meta }) => (
                    <AssetInput
                      label="Amount"
                      placeholder="0"
                      thousandSeparator={true}
                      assetDecimals={tokenDecimals}
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
                      currency={tokenSymbol}
                      error={(meta.modified || meta.submitFailed) && meta.error}
                      errorMessage={meta.error}
                      readOnly={estimating}
                      {...input}
                    />
                  )}
                </Field>
              </div>
            )}
            <div className="mt-6 flex items-start">
              <TxCheck
                tokenType={tokenType}
                token={token}
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
  },
);

type TxCheckProps = {
  tokenType: TokenType;
  token?: AccountToken;
  values: FormValues & { gas?: bigint };
  error: string | null;
};

const TxCheck = memo<TxCheckProps>(({ tokenType, token, values, error }) => {
  const nativeToken = useAccountToken<AccountAsset>(NATIVE_TOKEN_SLUG);

  const tokenUsdAmount = useMemo(
    () =>
      values.amount && token?.tokenType === TokenType.Asset
        ? new BigNumber(values.amount).multipliedBy(token.priceUSD ?? 0)
        : new BigNumber(0),
    [token, values.amount],
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
          "text-sm",
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
        {tokenType === TokenType.Asset && (
          <SummaryRow
            header="Amount"
            value={
              <PrettyAmount
                amount={values.amount || 0}
                currency={
                  token?.tokenType === TokenType.Asset
                    ? token.symbol
                    : undefined
                }
                className="font-semibold"
                copiable
              />
            }
            inBrackets={<FiatAmount amount={tokenUsdAmount} copiable />}
            className="mb-1.5"
          />
        )}

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
        {tokenType === TokenType.Asset && (
          <>
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
          </>
        )}
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
      className,
    )}
  >
    <h4
      className={classNames(
        "flex-nowrap font-semibold",
        lightHeader ? "text-brand-light" : "text-brand-inactivedark",
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
