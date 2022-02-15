import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";

import { SeedPharse, WalletStatus } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { addSeedPhrase } from "core/client";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";

import SelectLanguage from "app/components/blocks/SelectLanguage";
import LongTextField from "app/components/elements/LongTextField";
import Button from "app/components/elements/Button";
import { currentLocaleAtom, walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import { AddAccountStep } from "app/defaults";

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);

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
    <div className="my-16">
      <h1 className="mb-16 text-3xl text-white text-center">
        {importExisting ? "Import Seed Phrase" : "Add new Seed Phrase"}
      </h1>

      <div className="flex flex-col items-center justify-center">
        <SelectLanguage
          selected={locale}
          items={SUPPORTED_LOCALES}
          onSelect={setLocale}
        />

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
  );
});

export default AddSeedPhrase;
