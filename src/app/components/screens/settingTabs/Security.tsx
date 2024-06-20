import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtomValue, useAtom } from "jotai";
import { nanoid } from "nanoid";
import { FormApi } from "final-form";
import { Form, Field } from "react-final-form";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";

import { getSeedPhrase } from "core/client";
import { SeedPharse } from "core/types";

import { walletStateAtom, analyticsAtom, autoLockTimeoutAtom } from "app/atoms";
import {
  required,
  withHumanDelay,
  focusOnErrors,
  resetFormPassword,
} from "app/utils";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import Button from "app/components/elements/Button";
import SettingsHeader from "app/components/elements/SettingsHeader";
import PasswordField from "app/components/elements/PasswordField";
import Switcher from "app/components/elements/Switcher";
import Separator from "app/components/elements/Seperator";
import SeedPhraseWords from "app/components/blocks/SeedPhraseWords";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";
import Select from "app/components/elements/Select";
import { AUTO_LOCK_TIMEOUTS } from "fixtures/settings";

const prepareTimeout = (timeout: number) => ({
  key: timeout,
  value: AUTO_LOCK_TIMEOUTS.get(timeout) ?? "Default",
});

const prepareTimeouts = () => {
  const preparedTimeouts = [];
  for (const timeout of AUTO_LOCK_TIMEOUTS.keys()) {
    preparedTimeouts.push(prepareTimeout(timeout));
  }
  return preparedTimeouts;
};

const Security: FC = () => {
  const { hasSeedPhrase } = useAtomValue(walletStateAtom);
  const [analytics, setAnalytics] = useAtom(analyticsAtom);
  const [autoLockTimeout, setAutoLockTimeout] = useAtom(autoLockTimeoutAtom);

  const [revealModalOpened, setRevealModalOpened] = useState(false);

  const hanldeAnalyticsChange = useCallback(
    (enabled: boolean) => {
      setAnalytics({
        enabled,
        userId: analytics.userId ?? nanoid(),
      });
    },
    [setAnalytics, analytics],
  );

  const prepareCurrentTimeout = useMemo(
    () =>
      autoLockTimeout === undefined
        ? undefined
        : prepareTimeout(autoLockTimeout),
    [autoLockTimeout],
  );

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader className="!mb-3">Auto lock</SettingsHeader>
      <p className="mb-6 text-sm text-brand-font max-w-[30rem]">
        This profile will automatically locked after chosen period of
        inactivity.
      </p>
      <Select
        label="Period"
        items={prepareTimeouts()}
        currentItem={prepareCurrentTimeout}
        setItem={(u) => setAutoLockTimeout(u.key)}
        showSelected={true}
        className={classNames("max-w-[17.75rem]")}
        contentClassName="max-w-[17.75rem]"
      />
      <Separator className="mt-6 mb-8" />
      {hasSeedPhrase && (
        <>
          <SettingsHeader className="!mb-3">
            Reveal Secret Phrase
          </SettingsHeader>

          <p className="mb-6 text-sm text-brand-font max-w-[30rem]">
            Secret Phrase is a 12-word or 24-word phrase that is the “master
            key” to your wallets and funds.
            <br />
            You should always have a backup copy of it.
            <br />
            <strong>Never, ever share</strong> your Secret Phrase, not even with
            Wigwam!
          </p>

          <Button
            theme="secondary"
            className={classNames(
              "flex !justify-start items-center",
              "text-left",
              "!px-3 !py-2 mr-auto",
            )}
            onClick={() => setRevealModalOpened(true)}
          >
            <RevealIcon className="w-[1.625rem] h-auto mr-3" />
            Reveal
          </Button>

          <Separator className="mt-6 mb-8" />
        </>
      )}

      <SettingsHeader className="!mb-3">Privacy</SettingsHeader>

      <p className="mb-6 text-sm text-brand-font max-w-[30rem]">
        Read more about our{" "}
        <a
          href="https://wigwam.app/privacy"
          target="_blank"
          rel="nofollow noreferrer"
          className="underline"
        >
          privacy here
        </a>
        .
      </p>

      <Switcher
        id="analytics"
        label={
          <>
            Analytics
            <p className="text-xs text-brand-placeholder max-w-[18.75rem]">
              Anonymous. Help us make Wigwam better.
            </p>
          </>
        }
        text={analytics.enabled ? "Enabled" : "Disabled"}
        checked={analytics.enabled}
        onCheckedChange={hanldeAnalyticsChange}
        className="min-w-[17.75rem]"
      />

      {/* <Separator className="my-8" />
      <SettingsHeader>Security</SettingsHeader>
      <Switcher
        id="syncThirdParty"
        text={syncData ? "Syncing" : "Not syncing"}
        label="Sync data using third-party explorers"
        checked={syncData}
        onCheckedChange={setSyncData}
        className="min-w-[20rem]"
      />
      <Switcher
        id="phishingDetection"
        text={phishing ? "Enabled" : "Disabled"}
        checked={phishing}
        label="Use Phishing Detection"
        onCheckedChange={setPhishing}
        className="mt-3 min-w-[20rem]"
      /> */}

      {revealModalOpened && (
        <SeedPhraseModal
          open={true}
          onOpenChange={() => setRevealModalOpened(false)}
        />
      )}
    </div>
  );
};

export default Security;

type FormValues = {
  password: string;
};

const SeedPhraseModal = memo<SecondaryModalProps>(({ open, onOpenChange }) => {
  const [seedPhrase, setSeedPhrase] = useState<SeedPharse | null>(null);
  const windowFocused = useWindowFocus();

  useEffect(() => {
    if (!windowFocused && seedPhrase) {
      onOpenChange?.(false);
    }
  }, [onOpenChange, seedPhrase, windowFocused]);

  const handleConfirmPassword = useCallback(
    async (
      { password }: FormValues,
      form: FormApi<FormValues, Partial<FormValues>>,
    ) =>
      withHumanDelay(async () => {
        try {
          const seedPhrase = await getSeedPhrase(password);
          await resetFormPassword(form);

          setSeedPhrase(seedPhrase);
        } catch (err: any) {
          return { password: err?.message };
        }
        return;
      }),
    [],
  );

  return (
    <SecondaryModal
      header={seedPhrase ? "Your Secret Phrase" : "Type password"}
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase ? (
        <>
          <SeedPhraseWords seedPhrase={seedPhrase} />

          <div
            className={classNames(
              "mt-4 w-full max-w-[27.5rem]",
              "flex items-center",
              "p-4",
              "bg-brand-redobject/[.05]",
              "border border-brand-redobject/[.8]",
              "rounded-[.625rem]",
              "text-sm",
            )}
          >
            <span>
              <strong>DO NOT share</strong> this set of words with anyone! It
              can be used to steal all wallets belonging to this phrase.
            </span>
          </div>
        </>
      ) : (
        <Form<FormValues>
          decorators={[focusOnErrors]}
          onSubmit={handleConfirmPassword}
          destroyOnUnregister
          render={({ handleSubmit, submitting, modifiedSinceLastSubmit }) => (
            <form
              className="flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              <div className="w-[20rem] relative mb-3">
                <Field name="password" validate={required}>
                  {({ input, meta }) => (
                    <PasswordField
                      className="w-full"
                      placeholder={"*".repeat(8)}
                      label="Confirm your password"
                      error={
                        (meta.touched && meta.error) ||
                        (!modifiedSinceLastSubmit && meta.submitError)
                      }
                      errorMessage={
                        meta.error ||
                        (!modifiedSinceLastSubmit && meta.submitError)
                      }
                      autoFocus
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <Button
                type="submit"
                className="mt-6 !min-w-[14rem]"
                loading={submitting}
              >
                Reveal phrase
              </Button>
            </form>
          )}
        />
      )}
    </SecondaryModal>
  );
});
