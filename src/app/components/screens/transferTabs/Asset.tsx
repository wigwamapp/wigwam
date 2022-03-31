import { FC, ReactNode, useCallback, useEffect, useRef } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { createForm } from "final-form";
import { ethers } from "ethers";
import { usePrevious } from "lib/react-hooks/usePrevious";
import { Erc20__factory } from "abi-types";

import { AccountAsset } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";
import {
  composeValidators,
  maxLength,
  minLength,
  minValue,
  required,
} from "app/utils";

import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useNativeCurrency,
  useProvider,
  useConstant,
} from "app/hooks";
import { useToken } from "app/hooks/tokens";
import TokenSelect from "app/components/elements/TokenSelect";
import LongTextField from "app/components/elements/LongTextField";
import NewButton from "app/components/elements/NewButton";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import AssetInput from "app/components/elements/AssetInput";
import PrettyAmount from "app/components/elements/PrettyAmount";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { usePasteToClipboardWithMutator } from "lib/react-hooks/usePasteToClipboardWithMutator";

const Asset: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const currentToken = useToken(tokenSlug) as AccountAsset;
  const nativeCurrency = useNativeCurrency();

  const recipientAddressRef = useRef<HTMLTextAreaElement>(null);

  const prevToken = usePrevious(currentToken);

  const provider = useProvider();

  const sendEther = useCallback(
    async (to: string, amount: string) => {
      return await provider.getSigner(currentAccount.address).sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });
    },
    [currentAccount.address, provider]
  );

  const sendToken = useCallback(
    async (
      to: string,
      tokenContract: string,
      amount: string,
      decimals: number
    ) => {
      const signer = provider.getSigner(currentAccount.address);
      const contract = Erc20__factory.connect(tokenContract, signer);

      const convertedAmount = ethers.utils.parseUnits(amount, decimals);

      return await contract.transfer(to, convertedAmount);
    },
    [currentAccount.address, provider]
  );

  const handleSubmit = useCallback(
    async ({ to, amount }) => {
      const recipientAddress = recipientAddressRef.current;
      if (!recipientAddress || !amount || !tokenSlug) {
        return;
      }
      try {
        if (tokenSlug === NATIVE_TOKEN_SLUG) {
          await sendEther(to, amount);
        } else {
          const tokenContract = parseTokenSlug(tokenSlug).address;

          await sendToken(to, tokenContract, amount, currentToken.decimals);
        }
      } catch (err) {
        console.error("error", err);
      }
    },
    [currentToken, sendEther, sendToken, tokenSlug]
  );

  const setAmount = useCallback((args, state) => {
    const field = state.fields["amount"];
    field.change(args[0]);
  }, []);

  const setTo = useCallback((args, state) => {
    const field = state.fields["to"];
    field.change(args[0]);
    state.fields.amount.touched = false;
  }, []);

  const form = useConstant(() =>
    createForm({
      onSubmit: handleSubmit,
      mutators: { setAmount, setTo },
      initialValues: { amount: undefined },
    })
  )!;

  const { paste, pasted } = usePasteToClipboardWithMutator(form.mutators.setTo);

  const handleMaxButtonClick = useCallback(() => {
    form.mutators.setAmount(
      currentToken?.rawBalance
        ? new BigNumber(currentToken.rawBalance)
            .div(new BigNumber(10).pow(currentToken.decimals))
            .decimalPlaces(currentToken.decimals, BigNumber.ROUND_DOWN)
            .toString()
        : "0"
    );
  }, [currentToken, form]);

  useEffect(() => {
    if (currentToken !== prevToken) {
      form.mutators.setAmount(undefined);
    }
  }, [currentToken, prevToken, form]);

  return (
    <Form
      form={form}
      onSubmit={form.submit}
      render={({ handleSubmit, values, submitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <TokenSelect />
          <div className="relative mt-5">
            <Field
              name="to"
              validate={composeValidators(
                required,
                minLength(42),
                maxLength(42)
              )}
            >
              {({ input, meta }) => (
                <LongTextField
                  label="Recipient"
                  placeholder="0x0000000000000000000000000000000000000000"
                  textareaClassName="!h-20"
                  maxLength={42}
                  {...input}
                  error={meta.error && meta.touched}
                  errorMessage={meta.error}
                />
              )}
            </Field>
            <NewButton
              theme="tertiary"
              onClick={paste}
              className={classNames(
                "absolute bottom-[1.125rem] right-3",
                "text-sm text-brand-light",
                "!p-0 !pr-1 !min-w-0",
                "!font-normal",
                "cursor-copy",
                "items-center"
              )}
            >
              {pasted ? (
                <SuccessIcon className="mr-1" />
              ) : (
                <PasteIcon className="mr-1" />
              )}
              {pasted ? "Pasted" : "Paste"}
            </NewButton>
          </div>
          <div className="relative mt-5">
            <Field
              name="amount"
              validate={composeValidators(
                required,
                minValue(2, currentToken?.symbol)
              )}
            >
              {({ input, meta }) => (
                <AssetInput
                  label="Amount"
                  placeholder="0.00"
                  error={meta.error && meta.touched}
                  errorMessage={meta.error}
                  handleMaxButtonClick={handleMaxButtonClick}
                  assetDecimals={currentToken?.decimals}
                  withMaxButton
                  inputClassName="pr-20"
                  {...input}
                />
              )}
            </Field>
            {currentToken && (
              <span
                className={classNames(
                  "absolute top-11 right-4",
                  "text-sm font-bold"
                )}
              >
                {currentToken.symbol}
              </span>
            )}
          </div>
          <div className="mt-6 flex items-start">
            <Tooltip
              content={
                <>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                    aliquam, purus sit amet luctus venenatis, lectus magna
                    fringilla urna, porttitor rhoncus dolor purus non enim
                    praesent elementum facilisis leo
                  </p>
                  <p className="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                    aliquam, purus sit amet luctus venenatis, lectus magna
                    fringilla urna, porttitor rhoncus
                  </p>
                </>
              }
              placement="left-start"
              size="large"
              className="mr-2"
            >
              <TooltipIcon />
            </Tooltip>
            <div className="flex flex-col">
              <TippySingletonProvider>
                <SummaryRow
                  header={
                    <>
                      Amount:{" "}
                      <PrettyAmount
                        amount={values.amount ?? 0}
                        currency={currentToken?.symbol ?? undefined}
                        copiable
                        className="font-bold"
                      />
                    </>
                  }
                  value={
                    <PrettyAmount
                      amount={
                        values.amount && currentToken
                          ? new BigNumber(values.amount).multipliedBy(
                              currentToken.priceUSD ?? 0
                            )
                          : 0
                      }
                      currency="$"
                      copiable
                    />
                  }
                  className="mb-1"
                />
                <SummaryRow
                  header={
                    <>
                      Average Fee:{" "}
                      <PrettyAmount
                        amount={0.13}
                        currency={nativeCurrency?.symbol ?? undefined}
                        copiable
                        className="font-bold"
                      />
                    </>
                  }
                  value={<PrettyAmount amount={9.55} currency="$" copiable />}
                  className="mb-1"
                />
                <SummaryRow
                  header={
                    <>
                      Total:{" "}
                      <PrettyAmount
                        amount={
                          values.amount && currentToken
                            ? new BigNumber(values.amount)
                                .multipliedBy(currentToken.priceUSD ?? 0)
                                .plus(9.55)
                            : 9.55
                        }
                        currency="$"
                        copiable
                        className="font-bold"
                      />
                    </>
                  }
                />
              </TippySingletonProvider>
            </div>
          </div>
          <NewButton
            type="submit"
            className="flex items-center min-w-[13.75rem] mt-8 mx-auto"
            disabled={submitting}
          >
            <SendIcon className="mr-2" />
            {submitting ? "Transfering" : "Transfer"}
          </NewButton>
        </form>
      )}
    ></Form>
  );
};

export default Asset;

type SummaryRowProps = {
  header: string | ReactNode;
  value?: string | ReactNode;
  className?: string;
};

const SummaryRow: FC<SummaryRowProps> = ({ header, value, className }) => (
  <div className={classNames("flex items-center", "text-sm", className)}>
    <h4 className="font-bold">{header}</h4>
    {value && <span className="text-brand-inactivedark ml-1">({value})</span>}
  </div>
);
