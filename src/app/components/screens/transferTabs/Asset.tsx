import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { useForm, useField } from "react-final-form-hooks";
import { ethers } from "ethers";
import { ERC20__factory } from "abi-types";

import { AccountAsset } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";

import {
  composeValidators,
  maxValue,
  required,
  validateAddress,
  withHumanDelay,
  focusOnErrors,
} from "app/utils";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import { useNativeCurrency, useProvider, useToken } from "app/hooks";
import { useAccountToken } from "app/hooks/tokens";
import { useDialog } from "app/hooks/dialog";
import TokenSelect from "app/components/elements/TokenSelect";
import Button from "app/components/elements/Button";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import AssetInput from "app/components/elements/AssetInput";
import FiatAmount from "app/components/elements/FiatAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import AddressField from "app/components/elements/AddressField";
import InputLabelAction from "app/components/elements/InputLabelAction";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { suggestFees } from "../../../../core/client";

type FormValues = { amount: string; recipient: string; gas: ethers.BigNumber };

// TODO: Replace with final form hooks

const Asset: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom) ?? NATIVE_TOKEN_SLUG;
  const currentToken = useAccountToken(tokenSlug) as AccountAsset;
  const { alert } = useDialog();

  const provider = useProvider();

  const sendEther = useCallback(
    async (recipient: string, amount: string) => {
      return await provider
        .getUncheckedSigner(currentAccount.address)
        .sendTransaction({
          to: recipient,
          value: ethers.utils.parseEther(amount),
        });
    },
    [currentAccount.address, provider]
  );

  const sendToken = useCallback(
    async (
      recipient: string,
      tokenContract: string,
      amount: string,
      decimals: number
    ) => {
      const signer = provider.getUncheckedSigner(currentAccount.address);
      const contract = ERC20__factory.connect(tokenContract, signer);

      const convertedAmount = ethers.utils.parseUnits(amount, decimals);

      return await contract.transfer(recipient, convertedAmount);
    },
    [currentAccount.address, provider]
  );

  const handleFormSubmit = useCallback(
    async ({ recipient, amount }) =>
      withHumanDelay(async () => {
        if (!tokenSlug) {
          return;
        }
        try {
          if (tokenSlug === NATIVE_TOKEN_SLUG) {
            await sendEther(recipient, amount);
          } else {
            const tokenContract = parseTokenSlug(tokenSlug).address;

            await sendToken(
              recipient,
              tokenContract,
              amount,
              currentToken.decimals
            );
          }
        } catch (err: any) {
          alert({ title: "Error!", content: err.message });
        }
      }),
    [alert, currentToken, sendEther, sendToken, tokenSlug]
  );

  const maxAmount = useMemo(
    () =>
      currentToken?.rawBalance
        ? new BigNumber(currentToken.rawBalance)
            .div(new BigNumber(10).pow(currentToken.decimals))
            .decimalPlaces(currentToken.decimals, BigNumber.ROUND_DOWN)
            .toString()
        : "0",
    [currentToken]
  );

  const { form, handleSubmit, values, submitting } = useForm<FormValues>({
    onSubmit: handleFormSubmit,
    initialValues: {
      gas: ethers.BigNumber.from(0),
    },
  });
  const recipientInput = useField(
    "recipient",
    form,
    composeValidators(required, validateAddress)
  );
  const amountInput = useField(
    "amount",
    form,
    composeValidators(required, maxValue(maxAmount, currentToken?.symbol))
  );

  useEffect(() => {
    const unsubscribe = focusOnErrors(form);
    return () => unsubscribe();
  }, [form]);

  const estimateGas = useCallback(async () => {
    if (
      recipientInput.input.value &&
      !recipientInput.meta.error &&
      tokenSlug &&
      currentToken
    ) {
      let gasLimit;
      if (tokenSlug === NATIVE_TOKEN_SLUG) {
        gasLimit = await provider.estimateGas({
          to: recipientInput.input.value,
          value: ethers.utils.parseEther("1"),
        });
      } else {
        const tokenContract = parseTokenSlug(tokenSlug).address;

        const signer = provider.getUncheckedSigner(currentAccount.address);
        const contract = ERC20__factory.connect(tokenContract, signer);

        const convertedAmount = ethers.utils.parseUnits(
          "1",
          currentToken.decimals
        );

        gasLimit = await contract.estimateGas.transfer(
          recipientInput.input.value,
          convertedAmount
        );
      }

      const gasPrice = await suggestFees(provider);
      if (gasPrice) {
        form.change("gas", gasPrice.modes.average.max.mul(gasLimit));
      }
    }
  }, [
    currentAccount.address,
    currentToken,
    form,
    provider,
    recipientInput.input.value,
    recipientInput.meta.error,
    tokenSlug,
  ]);

  useEffect(() => {
    estimateGas();
  }, []);

  console.log("values", values);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-[23.25rem]">
      <TokenSelect
        handleTokenChanged={() => form.change("amount", undefined)}
      />
      <AddressField
        setFromClipboard={(value) => form.change("recipient", value)}
        error={recipientInput.meta.error && recipientInput.meta.touched}
        errorMessage={recipientInput.meta.error}
        className="mt-5"
        {...recipientInput.input}
      />
      <div className="relative mt-5">
        <AssetInput
          label="Amount"
          placeholder="0.00"
          thousandSeparator={true}
          assetDecimals={currentToken?.decimals}
          labelActions={
            <InputLabelAction onClick={() => form.change("amount", maxAmount)}>
              MAX
            </InputLabelAction>
          }
          currency={currentToken ? currentToken.symbol : undefined}
          error={amountInput.meta.modified && amountInput.meta.error}
          errorMessage={amountInput.meta.error}
          {...amountInput.input}
        />
      </div>
      <div className="mt-6 flex items-start">
        <TxCheck currentToken={currentToken} values={values} />
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
  );
};

export default Asset;

type TxCheckProps = {
  currentToken: AccountAsset;
  values: any;
};

const TxCheck = memo<TxCheckProps>(({ currentToken, values }) => {
  const provider = useProvider();
  const nativeToken = useAccountToken(NATIVE_TOKEN_SLUG);
  const [fee, setFee] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  // const preparedTx = useMemo(() => {
  //   // Create pseudo transaction
  // }, []);

  const estimateFee = useCallback(async () => {
    try {
      // const gasPrice = await provider.estimateGas();
      // OR contract.estimateGas.transfer(recipient, convertedAmount)
      const fee = await suggestFees(provider);
      if (fee) {
        setFee(fee.modes.average.max);
      }
    } catch (e) {}
  }, [provider]);

  useEffect(() => {
    estimateFee();
  }, [estimateFee]);

  console.log("gas", +fee);

  return (
    <>
      <Tooltip
        content={
          <>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus dolor purus non enim praesent elementum
              facilisis leo
            </p>
            <p className="mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus
            </p>
          </>
        }
        placement="left-start"
        size="large"
        className="mr-2"
      >
        <TooltipIcon />
      </Tooltip>
      <div className="flex flex-col w-full">
        <SummaryRow
          header="Amount"
          value={
            <PrettyAmount
              amount={values.amount ?? 0}
              currency={currentToken?.symbol}
              className="font-semibold"
              copiable
            />
          }
          inBrackets={
            <FiatAmount
              amount={
                values.amount && currentToken
                  ? new BigNumber(values.amount).multipliedBy(
                      currentToken.priceUSD ?? 0
                    )
                  : 0
              }
              copiable
            />
          }
          className="mb-1.5"
        />
        <SummaryRow
          header="Average Fee"
          value={
            <PrettyAmount
              amount={fee.toString()}
              currency={nativeToken?.symbol}
              decimals={nativeToken?.decimals}
              copiable
              className="font-semibold"
            />
            // <PrettyAmount
            //   amount={0.13}
            //   currency={nativeCurrency?.symbol}
            //   copiable
            //   className="font-semibold"
            // />
          }
          inBrackets={
            <FiatAmount
              amount={
                nativeToken
                  ? new BigNumber(
                      fee
                        .div(
                          new BigNumber(10)
                            .pow(nativeToken?.decimals)
                            .toString()
                        )
                        .toString()
                    )
                      .multipliedBy(nativeToken?.priceUSD ?? 0)
                      .toString()
                  : 0
              }
              copiable
            />
          }
          className="mb-2"
        />
        <hr className="border-brand-main/[.07]" />
        <SummaryRow
          className="mt-2"
          header="Total"
          lightHeader
          value={
            <FiatAmount
              amount={
                values.amount && currentToken
                  ? new BigNumber(values.amount)
                      .multipliedBy(currentToken.priceUSD ?? 0)
                      .plus(9.55)
                  : 9.55
              }
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
