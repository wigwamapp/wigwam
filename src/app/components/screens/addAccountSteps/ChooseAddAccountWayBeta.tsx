import { memo, useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { nanoid } from "nanoid";
import classNames from "clsx";
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
import { ReactComponent as TelegramIcon } from "app/icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "app/icons/twitter.svg";

import ChooseAddAccountWayOrigin from "./ChooseAddAccountWay";

const BETATEST_PROMOCODES =
  process.env.VIGVAM_BETATEST_PROMOCODES?.split(",").map((el) =>
    el.toLowerCase()
  ) ?? [];

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
      <AddAccountHeader className="mb-5">
        Beta testing is here! 🏕
      </AddAccountHeader>

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
                    label="It's a private beta. To participate, enter your promo code"
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
                    className="w-full"
                    actions={
                      <SuccessIcon
                        className={classNames(
                          "opacity-0 transition-opacity",
                          BETATEST_PROMOCODES.includes(
                            input.value?.toLowerCase()
                          ) && "opacity-100"
                        )}
                      />
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
                    containerClassName="w-full mt-6"
                  />
                )}
              </Field>
            </div>

            <div className="absolute left-0 right-0 bottom-[7.5rem] flex justify-center">
              <div className="flex items-stretch">
                <ul className="flex">
                  {mediaLinks.map(({ href, label, Icon }, i) => (
                    <li key={i} className="mr-1">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classNames(
                          "p-1",
                          "flex justify-center items-center",
                          "group"
                        )}
                        aria-label={label}
                      >
                        <Icon
                          className={classNames(
                            "w-8 h-8",
                            "fill-brand-inactivelight group-hover:fill-brand-light",
                            "group-focus-visible:fill-brand-light",
                            "transition-colors ease-in-out"
                          )}
                        />
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="ml-2 flex-1 text-left text-sm text-brand-inactivelight">
                  Don&#39;t have a promo code?
                  <br />
                  Join our communities and ask for invitation.
                </p>
              </div>
            </div>

            <AddAccountContinueButton loading={submitting} />
          </form>
        )}
      />
    </>
  );
});

export default ChooseAddAccountWayBeta;

const mediaLinks = [
  {
    href: "https://t.me/vigvamapp",
    label: "Telegram",
    Icon: TelegramIcon,
  },
  {
    href: "https://twitter.com/vigvamapp",
    label: "Twitter",
    Icon: TwitterIcon,
  },
];
