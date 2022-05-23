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
import { ethers } from "ethers";
import { useDebouncedCallback } from "use-debounce";
import { ERC20__factory } from "abi-types";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { AccountAsset } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";
import { suggestFees } from "core/client";

import {
  composeValidators,
  maxValue,
  required,
  validateAddress,
  withHumanDelay,
  focusOnErrors,
  OnChange,
} from "app/utils";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import { useProvider } from "app/hooks";
import { useAccountToken } from "app/hooks/tokens";
import { useDialog } from "app/hooks/dialog";
import TokenSelect from "app/components/elements/TokenSelect";
import Button from "app/components/elements/Button";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import AssetInput from "app/components/elements/AssetInput";
import FiatAmount from "app/components/elements/FiatAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import InputLabelAction from "app/components/elements/InputLabelAction";
import ContactAutocomplete from "app/components/elements/ContactAutocomplete";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as WarningIcon } from "app/icons/circle-warning.svg";

type FormValues = { amount: string; recipient: string };

const Asset: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom) ?? NATIVE_TOKEN_SLUG;
  const currentToken = useAccountToken(tokenSlug);
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

  const handleSubmit = useCallback(
    async ({ recipient, amount }) =>
      withHumanDelay(async () => {
        if (!currentToken) {
          return;
        }

        try {
          const { tokenSlug, decimals } = currentToken;

          if (tokenSlug === NATIVE_TOKEN_SLUG) {
            await sendEther(recipient, amount);
          } else {
            const tokenContract = parseTokenSlug(tokenSlug).address;

            await sendToken(recipient, tokenContract, amount, decimals);
          }
        } catch (err: any) {
          alert({ title: "Error!", content: err.message });
        }
      }),
    [alert, currentToken, sendEther, sendToken]
  );

  const [recipientAddr, setRecipientAddr] = useState<string>();
  const [gas, setGas] = useState<ethers.BigNumber>();
  const [estimationError, setEstimationError] = useState(false);

  const maxAmount = useMemo(() => {
    if (currentToken?.rawBalance) {
      let finalValue = new BigNumber(currentToken.rawBalance);
      if (tokenSlug === NATIVE_TOKEN_SLUG) {
        finalValue = finalValue.minus(new BigNumber(gas ? gas.toString() : 0));
      }
      const convertedValue = finalValue
        .div(new BigNumber(10).pow(currentToken.decimals))
        .decimalPlaces(currentToken.decimals, BigNumber.ROUND_DOWN);
      if (convertedValue.lt(0)) {
        return "0";
      }
      return convertedValue.toString();
    }
    return "0";
  }, [currentToken, gas, tokenSlug]);

  const estimateGas = useCallback(async () => {
    if (recipientAddr && tokenSlug && currentToken) {
      const value = 1;
      let gasLimit = ethers.BigNumber.from(0);
      try {
        if (tokenSlug === NATIVE_TOKEN_SLUG) {
          gasLimit = await provider.estimateGas({
            to: recipientAddr,
            value,
          });
        } else {
          const tokenContract = parseTokenSlug(tokenSlug).address;

          const signer = provider.getUncheckedSigner(currentAccount.address);
          const contract = ERC20__factory.connect(tokenContract, signer);

          gasLimit = await contract.estimateGas.transfer(recipientAddr, value);
        }
      } catch (e) {
        setEstimationError(true);
      }

      const gasPrice = await suggestFees(provider);
      if (gasPrice) {
        setGas(gasPrice.modes.average.max.mul(gasLimit));
      }
    }
  }, [
    currentAccount.address,
    currentToken,
    provider,
    recipientAddr,
    tokenSlug,
  ]);

  const handleRecipientChange = useDebouncedCallback((recipient: string) => {
    if (recipient && ethers.utils.isAddress(recipient)) {
      setRecipientAddr(recipient);
    }
  }, 150);

  useEffect(() => {
    estimateGas();
  }, [estimateGas]);

  const amountFieldKey = useMemo(
    () => `amount-${currentToken?.tokenSlug}-${maxAmount}`,
    [currentToken, maxAmount]
  );

  return (
    <Form<FormValues>
      onSubmit={handleSubmit}
      decorators={[focusOnErrors]}
      render={({ form, handleSubmit, values, submitting }) => (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-w-[23.25rem]"
        >
          <OnChange name="recipient" callback={handleRecipientChange} />
          <AccountChangeObserver onChange={() => form.restart()} />
          <TokenSelect
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
                  focus();
                }}
                error={meta.error && meta.touched}
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
                maxValue(maxAmount, currentToken?.symbol)
              )}
            >
              {({ input, meta }) => (
                <AssetInput
                  label="Amount"
                  placeholder="0.00"
                  thousandSeparator={true}
                  assetDecimals={currentToken?.decimals}
                  labelActions={
                    <InputLabelAction
                      onClick={() => form.change("amount", maxAmount)}
                    >
                      MAX
                    </InputLabelAction>
                  }
                  currency={currentToken ? currentToken.symbol : undefined}
                  error={meta.touched && meta.error}
                  errorMessage={meta.error}
                  {...input}
                />
              )}
            </Field>
          </div>
          <div className="mt-6 flex items-start">
            <TxCheck
              currentToken={currentToken}
              values={{ gas, ...values }}
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
};

export default Asset;

type AccountChangeObserverProps = {
  onChange: () => void;
};

const AccountChangeObserver: FC<AccountChangeObserverProps> = ({
  onChange,
}) => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const prevAccountAddress = usePrevious(currentAccount.address);

  useEffect(() => {
    if (currentAccount.address !== prevAccountAddress) {
      onChange();
    }
  }, [currentAccount, onChange, prevAccountAddress]);

  return null;
};

type TxCheckProps = {
  currentToken?: AccountAsset;
  values: FormValues & { gas?: ethers.BigNumber };
  error: boolean;
};

const TxCheck = memo<TxCheckProps>(({ currentToken, values, error }) => {
  const nativeToken = useAccountToken(NATIVE_TOKEN_SLUG);

  const tokenUsdAmount = useMemo(
    () =>
      values.amount && currentToken
        ? new BigNumber(values.amount).multipliedBy(currentToken.priceUSD ?? 0)
        : new BigNumber(0),
    [currentToken, values.amount]
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
    !nativeToken?.rawBalance ||
    new BigNumber(nativeToken.rawBalance).lte(0) ||
    new BigNumber(nativeToken.rawBalance).lt((values.gas ?? 0).toString()) ||
    error
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
        Insufficient funds for Network Fee
      </div>
    );
  }

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
              amount={values.amount || 0}
              currency={currentToken?.symbol}
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
