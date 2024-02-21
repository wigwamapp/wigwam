import { FC, useState } from "react";
import { Field, Form } from "react-final-form";
import classNames from "clsx";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {
  composeValidators,
  focusOnErrors,
  maxLength,
  minLength,
  required,
  validateAddress,
  validateEmail,
} from "app/utils";
import Input from "app/components/elements/Input";
import { useAtom, useAtomValue } from "jotai";
import { accountAddressAtom, analyticsAtom } from "app/atoms";
import HashPreview from "app/components/elements/HashPreview";
import Button from "app/components/elements/Button";
import AddressField from "app/components/elements/AddressField";
import Checkbox from "app/components/elements/Checkbox";
import WalletAvatar from "app/components/elements/WalletAvatar";
import WalletName from "app/components/elements/WalletName";
import { OverflowProvider, useAccounts } from "app/hooks";
// import { nanoid } from "nanoid";
import { FormApi } from "final-form";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { useDialog } from "app/hooks/dialog";

const TELEGRAM = "https://t.me/wigwamapp";
const DISCORD = "https://discord.gg/MAG2fnSqSK";

type FormValues = {
  promo: string;
  email: string;
  isAnalyticChecked: boolean;
  isTermsAccepted: boolean;
  altAddress: string;
};

const Rewards: FC = () => {
  const address = useAtomValue(accountAddressAtom);
  const { alert } = useDialog();
  const { currentAccount } = useAccounts();
  const [displayAltAddress, setAltAddressDisplaying] = useState(false);
  const [
    analytics,
    // setAnalytics
  ] = useAtom(analyticsAtom);

  const onSubmit = async () =>
    // values: FormValues
    {
      try {
        // if (!analytics.enabled) {
        //   setAnalytics({
        //     enabled: true,
        //     userId: analytics.userId ?? nanoid(),
        //   });
        // }
        // const payload = {
        //   address,
        //   ...values,
        // };
      } catch (err: any) {
        alert({ title: "Error!", content: err.message });
      }
    };

  return (
    <div className={classNames("p-6 pt-7 -mx-6 min-h-0", "flex flex-col grow")}>
      <OverflowProvider>
        {(ref) => (
          <ScrollAreaContainer
            ref={ref}
            className="pr-5 -mr-5"
            viewPortClassName="max-w-2xl"
            scrollBarClassName="py-0 pb-2"
          >
            <h1 className="mb-3 text-2xl font-bold">Rewards</h1>
            <p className="mb-6 text-base text-brand-gray">
              You should bind your wallet address to participate in our reward
              activities. By adding your email, you will agree that we may send
              you our reward announcements and other relevant to our app
              information. Follow your{" "}
              <a
                href={TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-brand-gray"
                aria-label="telegram"
              >
                Telegram
              </a>{" "}
              or{" "}
              <a
                className="font-semibold underline hover:text-brand-gray"
                href={DISCORD}
                target="_blank"
                rel="noreferrer"
                aria-label="discord"
              >
                Discord
              </a>{" "}
              channels to know more about our latest reward events.{" "}
            </p>
            <div className="pb-6 flex flex-col">
              <Form<FormValues>
                initialValues={{
                  isAnalyticChecked: analytics.enabled,
                }}
                decorators={[focusOnErrors]}
                onSubmit={onSubmit}
                render={({ form, handleSubmit, submitting, values }) => (
                  <>
                    <div className="mb-6 flex flex-col gap-2 w-full">
                      <p className="text-base text-brand-gray text-nowrap">
                        Your current wallet address:
                      </p>
                      <div className="flex items-start flex-col w-full">
                        <div className="mb-3 flex items-center gap-x-4">
                          <WalletAvatar seed={address!} className="h-8 w-8" />
                          <div>
                            <WalletName
                              wallet={currentAccount}
                              theme="small"
                              className="text-sm"
                            />
                            <HashPreview
                              hash={address!}
                              className="text-sm text-brand-light font-semibold leading-4 mr-1"
                              withTooltip={false}
                            />
                          </div>
                        </div>
                        {!displayAltAddress ? (
                          <Button
                            className="!p-0 underline !text-brand-gray"
                            theme="clean"
                            onClick={() => setAltAddressDisplaying(true)}
                          >
                            Add an alternative address
                          </Button>
                        ) : (
                          <Field
                            name="altAddress"
                            validate={composeValidators(validateAddress)}
                          >
                            {({ input, meta }) => (
                              <AddressField
                                label="Alternative Address"
                                setFromClipboard={(value) =>
                                  form.change("altAddress", value)
                                }
                                error={meta.error && meta.touched}
                                errorMessage={meta.error}
                                className="w-full max-w-md"
                                {...input}
                              />
                            )}
                          </Field>
                        )}
                      </div>
                    </div>
                    <Field
                      name="promo"
                      validate={composeValidators(minLength(4), maxLength(10))}
                    >
                      {({ input, meta }) => (
                        <Input
                          optional
                          label="Promo Code"
                          placeholder="Promo code"
                          error={meta.error && meta.touched}
                          errorMessage={meta.error}
                          className="max-w-md mb-6 w-full"
                          {...input}
                        />
                      )}
                    </Field>
                    <p className="mb-6 text-base font-semibold">
                      Add you email to know about our following raffles and
                      prizes
                    </p>
                    <Field
                      name="email"
                      validate={composeValidators(minLength(6), validateEmail)}
                    >
                      {({ input, meta }) => (
                        <Input
                          label="Email"
                          optional
                          placeholder="johndoe@email.com"
                          error={meta.error && meta.touched}
                          errorMessage={meta.error}
                          className="max-w-md mb-6 w-full"
                          {...input}
                        />
                      )}
                    </Field>
                    {!analytics.enabled ? (
                      <CheckboxWithLabel
                        className="mb-3"
                        value={values.isAnalyticChecked}
                        name="isAnalyticChecked"
                        form={form}
                        text="To track your statuses you should have a turned on app
                analytics"
                      />
                    ) : null}
                    <CheckboxWithLabel
                      className="mb-6"
                      value={values.isTermsAccepted}
                      form={form}
                      name="isTermsAccepted"
                      text="By participating in the program you agree that you wallet
                  address and transaction data will be saved for use in the
                  loyalty program"
                    />
                    <Button
                      className="mx-auto"
                      disabled={submitting}
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </>
                )}
              />
            </div>
          </ScrollAreaContainer>
        )}
      </OverflowProvider>
    </div>
  );
};

export default Rewards;

interface ICheckboxWithLabelProps {
  value: boolean;
  text: string;
  name: keyof FormValues;
  form: FormApi<FormValues, Partial<FormValues>>;
  className?: string;
}

const CheckboxWithLabel: FC<ICheckboxWithLabelProps> = ({
  value,
  text,
  name,
  form,
  className,
}) => (
  <Field name={name} validate={composeValidators(required)}>
    {({ meta }) => (
      <CheckboxPrimitive.Root
        className={classNames(className)}
        checked={value}
        id={name}
        onCheckedChange={(checked) => form.change(name, Boolean(checked))}
      >
        <div className="flex gap-x-4">
          <Checkbox
            checked={value}
            className={classNames(
              "shrink-0",
              value && "border border-brand-main",
              meta.touched &&
                !!meta.error &&
                !value &&
                "border !border-brand-redobject",
            )}
          />
          <label htmlFor={name} className="text-left text-sm">
            {text}
          </label>
        </div>
        <div
          className={classNames(
            "flex max-h-0 overflow-hidden",
            "transition-[max-height] duration-200",
            ((meta.touched && meta.error) ||
              meta.modifiedSinceLastSubmit ||
              meta.submitError) &&
              "max-h-5",
          )}
        >
          <span className="text-brand-redtext pt-1 text-xs">{meta.error}</span>
        </div>
      </CheckboxPrimitive.Root>
    )}
  </Field>
);
