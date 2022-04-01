import { memo, useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { wordlists } from "@ethersproject/wordlists";
import { toProtectedString } from "lib/crypto-utils";
import { Field, Form } from "react-final-form";

import { SeedPharse, WalletStatus } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { addSeedPhrase } from "core/client";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import {
  composeValidators,
  required,
  validateSeedPhrase as validateSeedPhraseValidator,
} from "app/utils";
import { currentLocaleAtom, walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);

const ImportSeedPhrase = memo(() => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const walletStatus = useAtomValue(walletStatusAtom);

  const { stateRef, navigateToStep } = useSteps();

  const initialSetup = walletStatus === WalletStatus.Welcome;

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
    async (values) => {
      const seedPhrase: SeedPharse = {
        phrase: toProtectedString(values.seed),
        lang: wordlistLocale,
      };

      try {
        validateSeedPhrase(seedPhrase);

        if (initialSetup) {
          stateRef.current.seedPhrase = seedPhrase;
        } else {
          await addSeedPhrase(seedPhrase);
        }

        navigateToStep(AddAccountStep.SelectAccountsToAddMethod);
      } catch (err: any) {
        alert(err?.message);
      }
    },
    [wordlistLocale, initialSetup, navigateToStep, stateRef]
  );

  console.log("locale", locale, wordlistLocale);

  return (
    <>
      <AddAccountHeader className="mb-8">
        Import existing Secret Phrase
      </AddAccountHeader>
      <Form
        onSubmit={handleContinue}
        mutators={{
          pasteFromClipboard: (args, state, utils) => {
            utils.changeValue(state, "seed", () => args[0]);
          },
        }}
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
                  validateSeedPhraseValidator(wordlistLocale)
                )}
              >
                {({ input, meta }) => (
                  <SeedPhraseField
                    placeholder="Paste there your secret phrase"
                    setFromClipboard={form.mutators.pasteFromClipboard}
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
