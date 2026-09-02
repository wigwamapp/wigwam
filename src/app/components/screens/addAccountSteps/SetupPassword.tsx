import { memo, useCallback, useEffect } from "react";
import { useSetAtom } from "jotai";
import { Field, Form } from "react-final-form";
import { FORM_ERROR, FormApi } from "final-form";
import classNames from "clsx";

import { AddAccountParams, SeedPharse } from "core/types";
import { setupWallet } from "core/client";

import {
  differentPasswords,
  required,
  withHumanDelay,
  focusOnErrors,
  composeValidators,
  validatePassword,
  resetFormPassword,
} from "app/utils";
import { addAccountModalAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AcceptCheckbox from "app/components/blocks/AcceptCheckbox";
import PasswordField from "app/components/elements/PasswordField";
import PasswordValidationField from "app/components/elements/PasswordValidationField";

type FormValues = {
  password: string;
  confirm: string;
  terms: boolean;
};

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
    async (
      { password }: FormValues,
      form: FormApi<FormValues, Partial<FormValues>>,
    ) =>
      withHumanDelay(async () => {
        try {
          if (!addAccountsParams) return;

          await setupWallet(password, addAccountsParams, seedPhrase);
          await resetFormPassword(form);
          await resetFormPassword(form, "confirm");

          setAccModalOpened([false]);
        } catch (err: any) {
          return { [FORM_ERROR]: err?.message };
        }
        return;
      }),
    [addAccountsParams, seedPhrase, setAccModalOpened],
  );

  if (!addAccountsParams) {
    return null;
  }

  return (
    <>
      <AddAccountHeader className="mb-7">Setup Password</AddAccountHeader>

      <Form<FormValues>
        initialValues={{ terms: false }}
        onSubmit={handleFinish}
        validate={(values) => ({
          confirm: differentPasswords(values.password, values.confirm),
        })}
        decorators={[focusOnErrors]}
        destroyOnUnregister
        render={({
          handleSubmit,
          submitting,
          modifiedSinceLastSubmit,
          submitError,
        }) => (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-w-[27.5rem] mx-auto"
          >
            <div className="max-w-[19rem] mx-auto flex flex-col items-center justify-center">
              <Field
                name="password"
                validate={composeValidators(required, validatePassword)}
              >
                {({ input, meta }) => (
                  <PasswordValidationField
                    error={
                      meta.error &&
                      meta.submitFailed &&
                      !meta.modifiedSinceLastSubmit
                    }
                    modified={meta.modified}
                    label="Create Password"
                    placeholder={"*".repeat(8)}
                    className="w-full mb-3"
                    {...input}
                  />
                )}
              </Field>
              <Field name="confirm" validate={required}>
                {({ input, meta }) => (
                  <PasswordField
                    placeholder={"*".repeat(8)}
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
                validate={required}
              >
                {({ input, meta }) => (
                  <AcceptCheckbox
                    {...input}
                    title="Accept terms"
                    description={
                      <>
                        I have read and agree to the
                        <br />
                        <a
                          href="https://ogwallet.tech/terms"
                          target="_blank"
                          rel="nofollow noreferrer"
                          className="text-brand-main underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Terms of Usage
                        </a>
                      </>
                    }
                    error={
                      (!modifiedSinceLastSubmit && submitError) ||
                      (meta.touched && meta.error)
                    }
                    errorMessage={
                      meta.error || (!modifiedSinceLastSubmit && submitError)
                    }
                    containerClassName={classNames("mt-6 w-full")}
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

export default SetupPassword;
