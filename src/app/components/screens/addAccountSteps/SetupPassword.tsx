import { FC, memo, useCallback, useEffect } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Field, Form } from "react-final-form";

import { AddAccountParams, SeedPharse } from "core/types";
import { setupWallet } from "core/client";

import { composeValidators, differentPasswords, required } from "app/utils";
import { addAccountModalAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";
import PasswordField from "app/components/elements/PasswordField";

const SetupPassword = memo(() => {
  const setAccModalOpened = useSetAtom(addAccountModalAtom);

  const { stateRef, reset } = useSteps();

  const addAccountsParams: AddAccountParams[] | undefined =
    stateRef.current.addAccountsParams;
  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;

  useEffect(() => {
    if (!addAccountsParams) {
      reset();
    }
  }, [addAccountsParams, reset]);

  const handleFinish = useCallback(
    async (values) => {
      try {
        const password = values.password;

        if (!addAccountsParams || !password || !values.terms) return;

        await setupWallet(password, addAccountsParams, seedPhrase);

        setAccModalOpened([false]);
      } catch (err: any) {
        alert(err?.message);
      }
    },
    [addAccountsParams, seedPhrase, setAccModalOpened]
  );

  if (!addAccountsParams) {
    return null;
  }

  return (
    <>
      <AddAccountHeader className="mb-7">Setup Password</AddAccountHeader>

      <Form
        initialValues={{ terms: false }}
        onSubmit={handleFinish}
        render={({ handleSubmit, values, submitting }) => (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-w-[27.5rem] mx-auto"
          >
            <div className="max-w-[19rem] mx-auto flex flex-col items-center justify-center">
              <Field name="password" validate={composeValidators(required)}>
                {({ input, meta }) => (
                  <PasswordField
                    placeholder="Type password"
                    label="New password"
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    className="w-full mb-3"
                    {...input}
                  />
                )}
              </Field>
              <Field
                name="confirm"
                validate={composeValidators(
                  required,
                  differentPasswords(values.password)
                )}
              >
                {({ input, meta }) => (
                  <PasswordField
                    placeholder="Confirm Password"
                    label="Confirm Password"
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    className="w-full"
                    {...input}
                  />
                )}
              </Field>
              <Field
                name="terms"
                format={(v: string) => Boolean(v)}
                validate={composeValidators(required)}
              >
                {({ input, meta }) => (
                  <AcceptTermsCheckbox
                    {...input}
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    className="mt-6"
                  />
                )}
              </Field>
            </div>
            <AddAccountContinueButton loading={submitting} />
          </form>
        )}
      />
    </>
  );
});

type AcceptTermsCheckboxProps = {
  value: boolean;
  onChange: (isInputChecked: boolean) => void;
  error?: boolean;
  errorMessage?: string;
  className?: string;
};

const AcceptTermsCheckbox: FC<AcceptTermsCheckboxProps> = ({
  value,
  onChange,
  error,
  errorMessage,
  className,
}) => (
  <div className="relative flex flex-col">
    <Checkbox.Root
      className={classNames(
        "w-full px-3 pt-2 pb-3",
        "rounded-[.625rem]",
        "bg-brand-main/[.05]",
        "flex",
        "transition-colors",
        "hover:bg-brand-main/[.1]",
        value && "bg-brand-main/[.1]",
        "border border-transparent",
        !!error && "!border-brand-redobject",
        className
      )}
      checked={value}
      onCheckedChange={(e) => {
        onChange(e === "indeterminate" ? false : e);
      }}
    >
      <div
        className={classNames(
          "w-5 h-5 min-w-[1.25rem] mt-0.5 mr-4",
          "bg-brand-main/20",
          "rounded",
          "flex items-center justify-center",
          value && "border border-brand-main",
          !!error && "border !border-brand-redobject"
        )}
      >
        <Checkbox.Indicator>{value && <CheckIcon />}</Checkbox.Indicator>
      </div>
      <div className="text-left">
        <h3 className="text-brand-light text-base font-semibold">
          Accept terms
        </h3>
        <p className="text-brand-inactivedark2 text-sm">
          I have read and agree to the Terms of Usage and Privacy Policy
        </p>
      </div>
    </Checkbox.Root>
    <div
      className={classNames(
        "flex max-h-0 overflow-hidden",
        "transition-[max-height] duration-200",
        error && errorMessage && "max-h-5"
      )}
    >
      <span className="text-brand-redtext pt-1 pl-4 text-xs">
        {errorMessage}
      </span>
    </div>
  </div>
);

export default SetupPassword;
