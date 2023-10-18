import { memo, useCallback, useEffect } from "react";
import { useSetAtom } from "jotai";
import { Field, Form } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { nanoid } from "nanoid";
import classNames from "clsx";
import { storage } from "lib/ext/storage";

import { AddAccountParams, SeedPharse } from "core/types";
import { Setting } from "core/common";
import { setupWallet, TEvent, trackEvent } from "core/client";

import {
  differentPasswords,
  required,
  withHumanDelay,
  focusOnErrors,
  composeValidators,
  validatePassword,
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
  analytics: boolean;
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
    async ({ password, analytics }: FormValues) =>
      withHumanDelay(async () => {
        try {
          if (!addAccountsParams) return;

          if (analytics) {
            await storage.put(Setting.Analytics, {
              enabled: true,
              userId: nanoid(),
            });
          }

          await setupWallet(password, addAccountsParams, seedPhrase);
          trackEvent(TEvent.SetupVigvam);

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
        initialValues={{ analytics: true, terms: false }}
        onSubmit={handleFinish}
        validate={(values) => ({
          confirm: differentPasswords(values.confirm)(values.password),
        })}
        decorators={[focusOnErrors]}
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

              <Field name="analytics" format={(v: string) => Boolean(v)}>
                {({ input, meta }) => (
                  <AcceptCheckbox
                    {...input}
                    title="Analytics"
                    description={
                      <>
                        Help us make Vigvam better.
                        <br />I agree to the{" "}
                        <a
                          href="https://wigwam.app/privacy"
                          target="_blank"
                          rel="nofollow noreferrer"
                          className="text-brand-main underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Anonymous Tracking
                        </a>
                      </>
                    }
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    containerClassName="w-full mt-6"
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
                          href="https://wigwam.app/terms"
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
                    containerClassName={classNames("mt-4 mb-6 w-full")}
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
