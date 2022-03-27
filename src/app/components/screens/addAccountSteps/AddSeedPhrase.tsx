import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";

import { SeedPharse, WalletStatus } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { addSeedPhrase } from "core/client";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import { currentLocaleAtom, walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import Select from "app/components/elements/Select";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);

const WORDS_COUNT = [12, 15, 18, 21, 24];

const AddSeedPhrase = memo(() => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const currentLocale = useAtomValue(currentLocaleAtom);
  const seedPhraseInputRef = useRef<HTMLTextAreaElement>(null);

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

  const generateNew = useCallback(() => {
    const extraEntropy = getRandomBytes();
    const wallet = ethers.Wallet.createRandom({
      locale: wordlistLocale,
      extraEntropy,
    });
    if (seedPhraseInputRef.current) {
      seedPhraseInputRef.current.value = wallet.mnemonic.phrase;
    }
  }, [wordlistLocale]);

  useEffect(() => {
    if (!importExisting) {
      setTimeout(generateNew, 0);
    }
  }, [generateNew, importExisting, wordlistLocale, wordsCount]);

  const handleContinue = useCallback(async () => {
    const inputSeedPhrase = seedPhraseInputRef.current?.value;

    if (!inputSeedPhrase) return;

    const seedPhrase: SeedPharse = {
      phrase: toProtectedString(inputSeedPhrase),
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
  }, [wordlistLocale, initialSetup, importExisting, stateRef, navigateToStep]);

  return (
    <>
      <AddAccountHeader className="mb-8">
        {importExisting
          ? "Import existing Secret Phrase"
          : "Create new Secret Phrase"}
      </AddAccountHeader>

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
              items={wordsCountList}
              currentItem={wordsCount}
              setItem={setWordsCount}
              label="Words"
              showSelected
              className="!min-w-[8.375rem]"
              contentClassName="!min-w-[8.375rem]"
            />
          )}
        </div>

        <SeedPhraseField
          ref={seedPhraseInputRef}
          onRegenerate={() => generateNew()}
          placeholder={
            importExisting
              ? "Paste there your secret phrase"
              : "Type there a secret phrase or generate new"
          }
          className="mt-8"
          mode={importExisting ? "import" : "create"}
          autoFocus={importExisting}
        />
      </div>
      <AddAccountContinueButton onContinue={handleContinue} />
    </>
  );
});

export default AddSeedPhrase;
