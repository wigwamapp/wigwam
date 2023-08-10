import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAtomValue } from "jotai";
import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";

import { SeedPharse } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import { currentLocaleAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import Select from "app/components/elements/Select";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SecretField from "app/components/blocks/SecretField";

const { arrayify, hexDataSlice, keccak256, concat } = ethers.utils;

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists,
);

const WORDS_COUNT = [12, 24];

const CreateSeedPhrase = memo(() => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const { alert } = useDialog();
  const [seedPhraseFiled, setSeedPhraseField] = useState("");

  const { stateRef, navigateToStep } = useSteps();

  const defaultLocale = useMemo(
    () =>
      SUPPORTED_LOCALES.find(({ code }) => currentLocale === code) ??
      FALLBACK_LOCALE,
    [currentLocale],
  );

  const [locale, setLocale] = useState(defaultLocale);

  const wordlistLocale = useMemo(
    () => toWordlistLang(locale.code),
    [locale.code],
  );

  const wordsCountList = useMemo(
    () =>
      WORDS_COUNT.map((count) => ({
        key: count,
        value: count.toString(),
      })),
    [],
  );

  const [wordsCount, setWordsCount] = useState(wordsCountList[0]);

  const handleContinue = useCallback(async () => {
    try {
      const inputSeedPhrase = seedPhraseFiled;

      if (!inputSeedPhrase) {
        throw new Error("Not a valid secret phrase");
      }

      const seedPhrase: SeedPharse = {
        phrase: toProtectedString(inputSeedPhrase),
        lang: wordlistLocale,
      };

      validateSeedPhrase(seedPhrase);

      stateRef.current.seedPhrase = seedPhrase;
      stateRef.current.seedPhraseLocale = wordlistLocale;

      navigateToStep(AddAccountStep.VerifySeedPhrase);
    } catch (err: any) {
      alert(err?.message);
    }
  }, [seedPhraseFiled, wordlistLocale, stateRef, navigateToStep, alert]);

  const generateNew = useCallback(() => {
    const entropySize = wordsCount.value === "12" ? 16 : 32;
    const baseEntropy = getRandomBytes(entropySize);
    const extraEntropy = getRandomBytes(entropySize);

    const entropy = arrayify(
      hexDataSlice(
        keccak256(concat([baseEntropy, extraEntropy])),
        0,
        entropySize,
      ),
    );

    const phrase = ethers.utils.entropyToMnemonic(
      entropy,
      wordlists[wordlistLocale],
    );

    setSeedPhraseField(phrase);
  }, [wordlistLocale, wordsCount]);

  useEffect(() => {
    setTimeout(generateNew, 0);
  }, [generateNew]);

  return (
    <>
      <AddAccountHeader className="mb-8">
        Create a new Secret Phrase
      </AddAccountHeader>
      <div className="flex flex-col max-w-[27.5rem] mx-auto">
        <div className="flex">
          <SelectLanguage
            selected={locale}
            items={SUPPORTED_LOCALES}
            onSelect={setLocale}
            className="mr-6"
          />
          <Select
            currentItem={wordsCount}
            setItem={setWordsCount}
            items={wordsCountList}
            label="Words"
            showSelected
            className="!min-w-[8.375rem]"
            contentClassName="!min-w-[8.375rem]"
          />
        </div>

        <SecretField
          onRegenerate={generateNew}
          isDownloadable
          placeholder="Type there a secret phrase or generate new"
          className="mt-8"
          value={seedPhraseFiled}
          onChange={(
            evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            const { value } = evt.target;
            setSeedPhraseField(value);
          }}
        />
      </div>
      <AddAccountContinueButton onContinue={handleContinue} />
    </>
  );
});

export default CreateSeedPhrase;
