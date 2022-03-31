import { FC, memo, useCallback, useEffect } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Field, Form } from "react-final-form";

import { AddAccountParams, SeedPharse } from "core/types";
import { setupWallet } from "core/client";

import {
  marked,
  composeValidators,
  differentPasswords,
  required,
} from "app/utils";
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
        initialValues={{ terms: "false" }}
        onSubmit={handleFinish}
        render={({ handleSubmit, values, submitting }) => (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-w-[27.5rem] mx-auto"
          >
            <div className="max-w-[19rem] mx-auto flex flex-col items-center justify-center">
              <div className="w-full relative mb-3">
                <Field name="password" validate={composeValidators(required)}>
                  {({ input, meta }) => (
                    <PasswordField
                      placeholder="Type password"
                      label="New password"
                      className="w-full"
                      error={meta.touched && meta.error}
                      errorMessage={meta.error}
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <div className="w-full relative">
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
                      className="w-full"
                      error={meta.touched && meta.error}
                      errorMessage={meta.error}
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <Field
                name="terms"
                validate={composeValidators(required, marked)}
              >
                {({ input, meta }) => (
                  <AcceptTermsCheckbox
                    {...input}
                    error={meta.touched && meta.error}
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
  value?: string;
  error?: boolean;
  onChange: (isInputChecked: string) => void;
  className?: string;
};

const AcceptTermsCheckbox: FC<AcceptTermsCheckboxProps> = ({
  value,
  error,
  onChange,
  className,
}) => {
  const checked = value === "true";
  console.log(`checked `, checked);
  console.log(`error `, error);
  return (
    <Checkbox.Root
      className={classNames(
        "w-full px-3 pt-2 pb-3",
        "rounded-[.625rem]",
        "bg-brand-main/[.05]",
        "flex",
        "transition-colors",
        "hover:bg-brand-main/[.1]",
        checked && "bg-brand-main/[.1]",
        !!error && "border !border-brand-redobject",
        className
      )}
      onCheckedChange={(e) => {
        onChange(e.toString());
      }}
    >
      <div
        className={classNames(
          "w-5 h-5 min-w-[1.25rem] mt-0.5 mr-4",
          "bg-brand-main/20",
          "rounded",
          "flex items-center justify-center",
          checked && "border border-brand-main",
          !!error && "border !border-brand-redobject"
        )}
      >
        <Checkbox.Indicator>{checked && <CheckIcon />}</Checkbox.Indicator>
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
  );
};

export default SetupPassword;
