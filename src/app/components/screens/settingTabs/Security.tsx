import { FC, memo, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import { useAtomValue, useAtom } from "jotai";
import { nanoid } from "nanoid";
import { Form, Field } from "react-final-form";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { fromProtectedString } from "lib/crypto-utils";

import { getSeedPhrase } from "core/client";

import { hasSeedPhraseAtom, analyticsAtom } from "app/atoms";
import { required, withHumanDelay, focusOnErrors } from "app/utils";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import SecretField from "app/components/blocks/SecretField";
import Button from "app/components/elements/Button";
import SettingsHeader from "app/components/elements/SettingsHeader";
import PasswordField from "app/components/elements/PasswordField";
import Switcher from "app/components/elements/Switcher";
import Separator from "app/components/elements/Seperator";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";

const Security: FC = () => {
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);
  const [analytics, setAnalytics] = useAtom(analyticsAtom);

  const [revealModalOpened, setRevealModalOpened] = useState(false);

  const hanldeAnalyticsChange = useCallback(
    (enabled: boolean) => {
      setAnalytics({
        enabled,
        userId: analytics.userId ?? nanoid(),
      });
    },
    [setAnalytics, analytics]
  );

  return (
    <div className="flex flex-col items-start">
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
            Vigvam!
          </p>

          <Button
            theme="secondary"
            className={classNames(
              "flex !justify-start items-center",
              "text-left",
              "!px-3 !py-2 mr-auto"
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
          href="https://vigvam.app/privacy"
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
              Anonymous. Help us make Vigvam better.
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
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const windowFocused = useWindowFocus();

  useEffect(() => {
    if (!windowFocused && seedPhrase) {
      onOpenChange?.(false);
    }
  }, [onOpenChange, seedPhrase, windowFocused]);

  const handleConfirmPassword = useCallback(
    async ({ password }) =>
      withHumanDelay(async () => {
        try {
          const seed = await getSeedPhrase(password);
          setSeedPhrase(seed.phrase);
        } catch (err: any) {
          return { password: err?.message };
        }
        return;
      }),
    []
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
          <SecretField
            label="Secret phrase"
            isDownloadable
            value={fromProtectedString(seedPhrase)}
          />
          <div
            className={classNames(
              "mt-4 w-full max-w-[27.5rem]",
              "flex items-center",
              "p-4",
              "bg-brand-redobject/[.05]",
              "border border-brand-redobject/[.8]",
              "rounded-[.625rem]",
              "text-sm"
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
