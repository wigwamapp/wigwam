import { memo, useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { wordlists } from "@ethersproject/wordlists";
import { toProtectedString } from "lib/crypto-utils";
import { Field, Form } from "react-final-form";

import { SeedPharse } from "core/types";
import { toWordlistLang } from "core/common";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import {
  composeValidators,
  required,
  validateSeedPhrase,
  withHumanDelay,
  focusOnErrors,
} from "app/utils";
import { currentLocaleAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SecretField from "app/components/blocks/SecretField";

type FormValues = {
  seed: string;
};

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);

const ImportSeedPhrase = memo(() => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const { alert } = useDialog();

  const { stateRef, navigateToStep } = useSteps();

  const defaultLocale = useMemo(
    () =>
      SUPPORTED_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale]
  );

  const [locale, setLocale] = useState(defaultLocale);

  const wordlistLocale = useMemo(
    () => toWordlistLang(locale.code),
    [locale.code]
  );

  const handleContinue = useCallback(
    async (values) =>
      withHumanDelay(async () => {
        try {
          const seedPhrase: SeedPharse = {
            phrase: toProtectedString(values.seed),
            lang: wordlistLocale,
          };

          stateRef.current.seedPhrase = seedPhrase;

          navigateToStep(AddAccountStep.SelectAccountsToAddMethod);
        } catch (err: any) {
          alert(err?.message);
        }
      }),
    [wordlistLocale, navigateToStep, stateRef, alert]
  );

  return (
    <>
      <AddAccountHeader className="mb-8">
        Import existing Secret Phrase
      </AddAccountHeader>
      <Form<FormValues>
        onSubmit={handleContinue}
        decorators={[focusOnErrors]}
        initialValues={{ seed: "" }}
        render={({ form, handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col max-w-[27.5rem] mx-auto">
              <div className="flex">
                <SelectLanguage
                  selected={locale}
                  items={SUPPORTED_LOCALES}
                  onSelect={setLocale}
                />
              </div>

              <Field
                name="seed"
                validate={composeValidators(
                  required,
                  validateSeedPhrase(wordlistLocale)
                )}
                format={(value) =>
                  value ? value.replace(/\n/g, " ").trim() : ""
                }
                formatOnBlur
              >
                {({ input, meta }) => (
                  <SecretField
                    placeholder="Paste there your secret phrase"
                    setFromClipboard={(value) => form.change("seed", value)}
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    className="mt-8"
                    {...input}
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

export default ImportSeedPhrase;
