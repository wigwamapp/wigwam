import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";
import { Field, Form } from "react-final-form";

import { SeedPharse, WalletStatus } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { addSeedPhrase } from "core/client";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import { composeValidators, exactLength, required } from "app/utils";
import { currentLocaleAtom, walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import Select from "app/components/elements/Select";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";
import { useConstant } from "app/hooks";
import { createForm } from "final-form";

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);

const WORDS_COUNT = [12, 15, 18, 21, 24];

const AddSeedPhrase = memo(() => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const currentLocale = useAtomValue(currentLocaleAtom);

  const { stateRef, navigateToStep } = useSteps();

  const importExisting = stateRef.current.addSeedPhraseType === "import";
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

  const wordsCountList = useMemo(
    () =>
      WORDS_COUNT.map((count) => ({
        key: count,
        value: count.toString(),
      })),
    []
  );

  const [wordsCount, setWordsCount] = useState(wordsCountList[0]);

  const handleContinue = useCallback(
    async (values) => {
      const seedPhrase: SeedPharse = {
        phrase: toProtectedString(values.seed),
        lang: wordlistLocale,
      };

      try {
        validateSeedPhrase(seedPhrase);

        if (!initialSetup && importExisting) {
          await addSeedPhrase(seedPhrase);
        } else {
          stateRef.current.seedPhrase = seedPhrase;
        }

        navigateToStep(
          importExisting
            ? AddAccountStep.SelectAccountsToAddMethod
            : AddAccountStep.VerifySeedPhrase
        );
      } catch (err: any) {
        alert(err?.message);
      }
    },
    [wordlistLocale, initialSetup, importExisting, stateRef, navigateToStep]
  );

  const setPhrase = useCallback((args, state) => {
    const field = state.fields["seed"];
    field.change(args[0]);
  }, []);

  const form = useConstant(() =>
    createForm({
      onSubmit: handleContinue,
      mutators: { setPhrase },
    })
  )!;

  const generateNew = useCallback(() => {
    const extraEntropy = getRandomBytes();
    const wallet = ethers.Wallet.createRandom({
      locale: wordlistLocale,
      extraEntropy,
    });
    form.mutators.setPhrase(wallet.mnemonic.phrase);
  }, [form, wordlistLocale]);

  useEffect(() => {
    if (!importExisting) {
      setTimeout(generateNew, 0);
    }
  }, [generateNew, importExisting, wordlistLocale, wordsCount]);

  return (
    <>
      <AddAccountHeader className="mb-8">
        {importExisting
          ? "Import existing Secret Phrase"
          : "Create new Secret Phrase"}
      </AddAccountHeader>
      <Form
        form={form}
        onSubmit={form.submit}
        render={({ form, handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col max-w-[27.5rem] mx-auto">
              <div className="flex">
                <SelectLanguage
                  selected={locale}
                  items={SUPPORTED_LOCALES}
                  onSelect={setLocale}
                  className="mr-6"
                />
                {!importExisting && (
                  <Select
                    currentItem={wordsCount}
                    setItem={setWordsCount}
                    items={wordsCountList}
                    label="Words"
                    showSelected
                    className="!min-w-[8.375rem]"
                    contentClassName="!min-w-[8.375rem]"
                  />
                )}
              </div>

              <Field
                name="seed"
                validate={composeValidators(
                  required,
                  exactLength(Number(wordsCount.value))
                )}
              >
                {({ input, meta }) => (
                  <SeedPhraseField
                    onRegenerate={generateNew}
                    mutator={form.mutators.setPhrase}
                    placeholder={
                      importExisting
                        ? "Paste there your secret phrase"
                        : "Type there a secret phrase or generate new"
                    }
                    className="mt-8"
                    mode={importExisting ? "import" : "create"}
                    autoFocus={importExisting}
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
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

export default AddSeedPhrase;
