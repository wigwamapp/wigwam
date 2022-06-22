import { memo, useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { nanoid } from "nanoid";
import { storage } from "lib/ext/storage";

import { WalletStatus } from "core/types";
import { Setting } from "core/common";
import { trackEvent, TEvent } from "core/client";

import {
  betaTestCodeAtom,
  betaTestEnabledAtom,
  walletStatusAtom,
} from "app/atoms";
import { required, withHumanDelay, focusOnErrors } from "app/utils";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AcceptCheckbox from "app/components/blocks/AcceptCheckbox";
import Input from "app/components/elements/Input";
import { ReactComponent as SuccessIcon } from "app/icons/green-check.svg";

import ChooseAddAccountWayOrigin from "./ChooseAddAccountWay";

const BETATEST_PROMOCODES =
  process.env.VIGVAM_BETATEST_PROMOCODES?.split(",") ?? [];

type FormValues = {
  code: string;
  analytics: boolean;
};

const ChooseAddAccountWayBeta = memo(() => {
  const isWelcome = useAtomValue(walletStatusAtom) === WalletStatus.Welcome;

  const betaTestCode = useAtomValue(betaTestCodeAtom);
  const [betaTestEnabled, setBetaTestEnabled] = useAtom(betaTestEnabledAtom);

  const handleFinish = useCallback(
    async ({ code, analytics }: FormValues) =>
      withHumanDelay(async () => {
        code = code?.toLowerCase();

        try {
          if (!BETATEST_PROMOCODES.includes(code)) {
            throw new Error("Invalid promocode");
          }

          if (analytics) {
            await storage.put(Setting.Analytics, {
              enabled: true,
              userId: nanoid(),
            });
          }

          trackEvent(TEvent.Promocode, { code });

          await new Promise((r) => setTimeout(r, 500));
          setBetaTestEnabled("true");
        } catch (err: any) {
          return { [FORM_ERROR]: err?.message };
        }

        return;
      }),
    [setBetaTestEnabled]
  );

  if (!isWelcome || betaTestEnabled === "true") {
    return <ChooseAddAccountWayOrigin />;
  }

  return (
    <>
      <AddAccountHeader className="mb-7">Beta testing</AddAccountHeader>

      <Form<FormValues>
        initialValues={{ code: betaTestCode, analytics: true }}
        onSubmit={handleFinish}
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
            <div className="w-[19rem] mx-auto flex flex-col items-center justify-center">
              <Field
                name="code"
                format={(v) => v?.toUpperCase() ?? ""}
                validate={required}
              >
                {({ input, meta }) => (
                  <Input
                    label="Beta test promocode"
                    placeholder="Type promocode..."
                    error={
                      (!modifiedSinceLastSubmit && submitError) ||
                      (meta.error &&
                        meta.submitFailed &&
                        !meta.modifiedSinceLastSubmit)
                    }
                    errorMessage={
                      meta.error || (!modifiedSinceLastSubmit && submitError)
                    }
                    className="w-full mb-3"
                    actions={
                      BETATEST_PROMOCODES.includes(
                        input.value?.toLowerCase()
                      ) ? (
                        <SuccessIcon />
                      ) : null
                    }
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
                          href="https://vigvam.app/privacy"
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
                    containerClassName="w-full"
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

export default ChooseAddAccountWayBeta;
