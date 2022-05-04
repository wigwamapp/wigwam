import { FC, memo, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import { Form, Field } from "react-final-form";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { fromProtectedString } from "lib/crypto-utils";

import { getSeedPhrase } from "core/client";

import { required, withHumanDelay, focusOnErrors } from "app/utils";
import Switcher from "app/components/elements/Switcher";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import SecretField from "app/components/blocks/SecretField";
import Button from "app/components/elements/Button";
import SettingsHeader from "app/components/elements/SettingsHeader";
import Separator from "app/components/elements/Seperator";
import PasswordField from "app/components/elements/PasswordField";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";

const Security: FC = () => {
  const [revealModalOpened, setRevealModalOpened] = useState(false);
  const [syncData, setSyncData] = useState(false);
  const [phishing, setPhishing] = useState(false);

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>Reveal Secret Phrase</SettingsHeader>
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
      <Separator className="my-8" />
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
      />
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
      header="Reveal secret phrase"
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase ? (
        <SecretField isDownloadable value={fromProtectedString(seedPhrase)} />
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
                Reveal
              </Button>
            </form>
          )}
        />
      )}
    </SecondaryModal>
  );
});
