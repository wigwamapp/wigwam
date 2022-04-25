import { FC, memo, ReactNode, useCallback, useMemo } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { ethers } from "ethers";
import { Erc20__factory } from "abi-types";
import createDecorator from "final-form-focus";

import { AccountAsset } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";

import {
  composeValidators,
  maxValue,
  required,
  validateAddress,
  withHumanDelay,
} from "app/utils";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useNativeCurrency,
  useProvider,
} from "app/hooks";
import { useAccountToken } from "app/hooks/tokens";
import { useDialog } from "app/hooks/dialog";
import TokenSelect from "app/components/elements/TokenSelect";
import NewButton from "app/components/elements/NewButton";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import AssetInput from "app/components/elements/AssetInput";
import PrettyAmount from "app/components/elements/PrettyAmount";
import AddressField from "app/components/elements/AddressField";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";

const Asset: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom) ?? NATIVE_TOKEN_SLUG;
  const currentToken = useAccountToken(tokenSlug) as AccountAsset;
  const { alert } = useDialog();

  const provider = useProvider();

  const sendEther = useCallback(
    async (recipient: string, amount: string) => {
      return await provider.getSigner(currentAccount.address).sendTransaction({
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
      const signer = provider.getSigner(currentAccount.address);
      const contract = Erc20__factory.connect(tokenContract, signer);

      const convertedAmount = ethers.utils.parseUnits(amount, decimals);

      return await contract.transfer(recipient, convertedAmount);
    },
    [currentAccount.address, provider]
  );

  const handleSubmit = useCallback(
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

  const focusOnErrors = createDecorator();
  const setAmount = useCallback((args, state, utils) => {
    utils.changeValue(state, "amount", () => args[0]);
  }, []);
  const setRecipient = useCallback((args, state, utils) => {
    utils.changeValue(state, "recipient", () => args[0]);
  }, []);

  return (
    <Form
      onSubmit={handleSubmit}
      decorators={[focusOnErrors]}
      mutators={{ setAmount, setRecipient }}
      render={({ form, handleSubmit, values, submitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <TokenSelect
            handleTokenChanged={() => form.mutators.setAmount(undefined)}
          />
          <Field
            name="recipient"
            validate={composeValidators(required, validateAddress)}
          >
            {({ input, meta }) => (
              <AddressField
                setFromClipboard={form.mutators.setRecipient}
                error={meta.error && meta.touched}
                errorMessage={meta.error}
                className="mt-5"
                {...input}
              />
            )}
          </Field>
          <div className="relative mt-5">
            <Field
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
                  withMaxButton
                  handleMaxButtonClick={() =>
                    form.mutators.setAmount(maxAmount)
                  }
                  error={meta.error && meta.modified}
                  errorMessage={meta.error}
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
            <TxCheck currentToken={currentToken} values={values} />
          </div>
          <NewButton
            type="submit"
            className="flex items-center min-w-[13.75rem] mt-8 mx-auto"
            loading={submitting}
          >
            <SendIcon className="mr-2" />
            {submitting ? "Transfering" : "Transfer"}
          </NewButton>
        </form>
      )}
    />
  );
};

export default Asset;

type TxCheckProps = {
  currentToken: AccountAsset;
  values: any;
};

const TxCheck = memo<TxCheckProps>(({ currentToken, values }) => {
  const nativeCurrency = useNativeCurrency();

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
    </>
  );
});

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
