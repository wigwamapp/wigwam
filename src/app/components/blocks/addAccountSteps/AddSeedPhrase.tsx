import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai/utils";
import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";

import { SeedPharse, WalletStatus } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { addSeedPhrase } from "core/client";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/defaults";
import { currentLocaleAtom, walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import LongTextField from "app/components/elements/LongTextField";
import Button from "app/components/elements/Button";
import Select from "app/components/elements/Select";
import NewSelectLanguage from "app/components/blocks/NewSelectLanguage";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";

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

  const [seedPhraseText, setSeedPhraseText] = useState<string>("");

  const generateNew = useCallback(() => {
    const extraEntropy = getRandomBytes();
    const wallet = ethers.Wallet.createRandom({
      locale: wordlistLocale,
      extraEntropy,
    });
    setSeedPhraseText(wallet.mnemonic.phrase);
  }, [wordlistLocale, setSeedPhraseText]);

  useEffect(() => {
    if (!importExisting) {
      setSeedPhraseText("");
    }
  }, [importExisting, setSeedPhraseText, wordlistLocale]);

  const handleContinue = useCallback(async () => {
    const seedPhrase: SeedPharse = {
      phrase: toProtectedString(seedPhraseText),
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
          ? AddAccountStep.VerifyToAdd
          : AddAccountStep.VerifySeedPhrase
      );
    } catch (err: any) {
      alert(err?.message);
    }
  }, [
    wordlistLocale,
    seedPhraseText,
    initialSetup,
    importExisting,
    stateRef,
    navigateToStep,
  ]);

  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);

  return (
    <>
      <div className="my-16">
        <AddAccountHeader className="mb-8">
          {importExisting
            ? "Import existing Secret Phrase"
            : "Create new Secret Phrase"}
        </AddAccountHeader>

        <div className="flex flex-col items-center justify-center">
          <div className="flex">
            <NewSelectLanguage
              selected={locale}
              items={SUPPORTED_LOCALES}
              onSelect={setLocale}
              className="mr-6"
            />
            <Select
              items={wordsCountList}
              currentItem={wordsCount}
              setItem={setWordsCount}
              label="Words"
              showSelected
              className="!min-w-[8.375rem]"
            />
          </div>

          <div className="my-16 flex flex-col items-center justify-center">
            {importExisting || seedPhraseText ? (
              <>
                <div>
                  <div className="flex items-center text-white mb-2 text-lg">
                    <span>Seed Phrase</span>
                    <div className="flex-1" />
                    <button onClick={copy}>{copied ? "Copied" : "Copy"}</button>
                  </div>
                  <LongTextField
                    ref={fieldRef}
                    value={seedPhraseText}
                    className="mb-16 w-96 h-36 resize-none"
                    onChange={(evt) => setSeedPhraseText(evt.target.value)}
                  />
                </div>
                <Button onClick={handleContinue}>Continue</Button>
              </>
            ) : (
              <Button onClick={() => generateNew()}>Create</Button>
            )}
          </div>
        </div>
      </div>
      <AddAccountContinueButton onContinue={handleContinue} />
    </>
  );
});

export default AddSeedPhrase;
