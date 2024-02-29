import { FC, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Field, Form } from "react-final-form";
import classNames from "clsx";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { FormApi } from "final-form";
import { useLazyAtomValue } from "lib/atom-utils";

import { indexerApi } from "core/common/indexerApi";

import {
  composeValidators,
  focusOnErrors,
  maxLength,
  minLength,
  required,
  validateAddress,
  validateEmail,
} from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { OverflowProvider, useAccounts, useProvider } from "app/hooks";
import {
  getAppliedForRewardsAtom,
  analyticsAtom,
  rewardsApplicationAtom,
} from "app/atoms";

import Input from "app/components/elements/Input";
import HashPreview from "app/components/elements/HashPreview";
import Button from "app/components/elements/Button";
import AddressField from "app/components/elements/AddressField";
import Checkbox from "app/components/elements/Checkbox";
import WalletAvatar from "app/components/elements/WalletAvatar";
import WalletName from "app/components/elements/WalletName";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as SuccessGreen } from "app/icons/success-green.svg";

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
  const { currentAccount } = useAccounts();
  const [analytics, setAnalytics] = useAtom(analyticsAtom);
  const [rewardsApplication, setRewardsApplication] = useAtom(
    rewardsApplicationAtom,
  );
  const { alert } = useDialog();

  const [displayAltAddress, setAltAddressDisplaying] = useState(false);
  const [processing, setProcessing] = useState(false);

  const applied = useLazyAtomValue(
    getAppliedForRewardsAtom(currentAccount.address),
    "off",
  );

  const existingApplication = useMemo(() => {
    try {
      if (rewardsApplication) return JSON.parse(rewardsApplication);
    } catch {}

    return null;
  }, [rewardsApplication]);

  const analyticsEnabledRef = useRef(analytics.enabled);

  const signer = useProvider().getUncheckedSigner(currentAccount.address);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (processing) return;
      setProcessing(true);

      try {
        if (!analytics.enabled) {
          setAnalytics({
            enabled: true,
            userId: analytics.userId ?? nanoid(),
          });
        }

        const payload = {
          address: currentAccount.address,
          altAddress: values.altAddress || undefined,
          email: values.email,
          promo: values.promo || undefined,
        };

        const { data: authMessage } = await indexerApi.get("/auth-message");

        const signature = await signer.signMessage(
          authMessage.replace("{address}", currentAccount.address),
        );

        const res = await indexerApi.post("/activity/apply", payload, {
          headers: {
            "auth-signature": signature,
          },
        });

        if (res.status >= 200 && res.status < 300) {
          setRewardsApplication(
            JSON.stringify({
              name: currentAccount.name,
              address: currentAccount.address,
              altAddress: values.altAddress || "",
            }),
          );
        }
      } catch (err: any) {
        alert({
          title: "Error!",
          content:
            err?.response?.data ||
            err?.message ||
            "Failed to apply. Please try again later.",
        });
      }

      setProcessing(false);
    },
    [
      setRewardsApplication,
      currentAccount,
      analytics,
      setAnalytics,
      alert,
      signer,
      setProcessing,
      processing,
    ],
  );

  let content: ReactNode;

  if (applied === true || existingApplication) {
    content = (
      <div>
        <h2 className="font-semibold text-lg mt-4 text-brand-lightgray">
          You are currently engaged in our reward programs.
        </h2>

        <p className="text-sm text-brand-gray mt-1 mb-4">
          Keep an eye out for upcoming events where you can earn more rewards!
        </p>

        <div
          className={classNames(
            "mb-3 p-4 w-full",
            "flex items-center gap-x-4",
            "border border-brand-main/5 rounded-[.625rem] bg-black/10",
          )}
        >
          <WalletAvatar
            seed={existingApplication?.address ?? currentAccount.address}
            className="h-12 w-12"
          />
          <div>
            <WalletName
              wallet={existingApplication ?? currentAccount}
              theme="small"
              className="text-xl"
            />
            <HashPreview
              hash={existingApplication?.address ?? currentAccount.address}
              className="text-base text-brand-light leading-4 mr-1"
              withTooltip={false}
            />
          </div>

          <div className="flex-1" />

          <SuccessGreen className="w-8" />
        </div>
      </div>
    );
  } else if (applied === false) {
    content = (
      <Form<FormValues>
        initialValues={{
          isAnalyticChecked: analyticsEnabledRef.current,
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
                <div
                  className={classNames(
                    "mb-3 p-4 w-full",
                    "flex items-center gap-x-4",
                    "border border-brand-main/5 rounded-[.625rem] bg-black/10",
                  )}
                >
                  <WalletAvatar
                    seed={currentAccount.address}
                    className="h-12 w-12"
                  />
                  <div>
                    <WalletName
                      wallet={currentAccount}
                      theme="small"
                      className="text-xl"
                    />
                    <HashPreview
                      hash={currentAccount.address}
                      className="text-base text-brand-light leading-4 mr-1"
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
                        className="w-full "
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
                  className=" mb-6 w-full"
                  {...input}
                />
              )}
            </Field>
            <p className="mb-6 text-sm font-semibold">
              Add you email to know about our following raffles and prizes
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
                  className="mb-6 w-full"
                  {...input}
                />
              )}
            </Field>
            {!analyticsEnabledRef.current ? (
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
                  address and transaction data will be analyzed for use in the
                  loyalty program"
            />
            <Button
              className="mx-auto"
              disabled={submitting}
              onClick={handleSubmit}
              loading={processing}
            >
              Submit
            </Button>
          </>
        )}
      />
    );
  } else if (applied === "error") {
    content = (
      <div className="text-sm font-medium text-brand-redobject">
        Oops! Failed to check if the wallet has already been applied.
        <br />
        Please try again later.
      </div>
    );
  } else {
    content = (
      <div className="w-full p-6 flex items-center">
        <div className="atom-spinner w-16 h-16" />
      </div>
    );
  }

  return (
    <div className={classNames("-mx-6 px-6 min-h-0", "flex flex-col grow")}>
      <OverflowProvider>
        {(ref) => (
          <ScrollAreaContainer
            ref={ref}
            className="-mr-5"
            viewPortClassName="max-w-2xl"
            scrollBarClassName="pb-1"
          >
            <h1 className="mt-5 mb-3 text-2xl font-bold">Rewards 🎁</h1>

            {applied === true || existingApplication
              ? ALREADY_PARTICIPATING_CONTENT
              : applied === undefined
                ? null
                : PARTICIPATE_CONTENT}

            <div className="pb-6 flex flex-col max-w-md">{content}</div>
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
        <div className="flex gap-x-4 max-w-md">
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

const ALREADY_PARTICIPATING_CONTENT = (
  <>
    <p className="mb-6 text-base text-brand-gray">
      You are already participating in the Wigwam rewards program. A huge thank
      you for your support! Stay ahead of the curve - follow us on{" "}
      <a
        href={TELEGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline hover:text-brand-gray"
        aria-label="telegram"
      >
        Telegram
      </a>{" "}
      and{" "}
      <a
        className="font-semibold underline hover:text-brand-gray"
        href={DISCORD}
        target="_blank"
        rel="noreferrer"
        aria-label="discord"
      >
        Discord
      </a>{" "}
      for the latest updates and ensure you never miss out on key promotional
      events.
    </p>
  </>
);

const PARTICIPATE_CONTENT = (
  <>
    <p className="mb-2 text-base text-brand-gray">
      Unlock exclusive rewards by linking your wallet address with us!
    </p>

    <p className="mb-2 text-base text-brand-gray">
      You should bind your wallet address below to participate in our regular
      rewarded activities. You can bind your Wigwam address and any alternative
      EVM address you currently use. Join our{" "}
      <a
        href={TELEGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline hover:text-brand-gray"
        aria-label="telegram"
      >
        Telegram
      </a>{" "}
      and{" "}
      <a
        className="font-semibold underline hover:text-brand-gray"
        href={DISCORD}
        target="_blank"
        rel="noreferrer"
        aria-label="discord"
      >
        Discord
      </a>{" "}
      communities today and be the first to hear about our upcoming reward
      events.
    </p>

    <p className="mb-6 text-base text-brand-gray">
      Remember to leave your email if you want to receive information about our
      product updates and new promotional campaigns.
    </p>
  </>
);
