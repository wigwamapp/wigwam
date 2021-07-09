import { memo, useCallback, useEffect, useMemo, useState } from "react";
// import classNames from "clsx";
import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";

import { getLocale } from "lib/ext/i18n/react";
import { getRandomBytes } from "lib/encryptor";
import { SeedPharse } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/helpers";
import { DEFAULT_LOCALES, FALLBACK_LOCALE } from "fixtures/locales";
import SelectLanguage from "app/components/blocks/SelectLanguage";
import LongTextField from "app/components/elements/LongTextField";
import Button from "app/components/elements/Button";

const SUPPORTED_LOCALES = DEFAULT_LOCALES.filter(
  ({ code }) => toWordlistLang(code) in wordlists
);

type AddSeedPhraseProps = {
  importExisting?: boolean;
};

const AddSeedPhrase = memo<AddSeedPhraseProps>(({ importExisting }) => {
  const defaultLocale = useMemo(() => {
    const currentCode = getLocale();
    return (
      SUPPORTED_LOCALES.find(({ code }) => currentCode === code) ??
      FALLBACK_LOCALE
    );
  }, []);

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

  const navigateToSelectAccount = useCallback(() => {
    const seedPhrase: SeedPharse = {
      phrase: seedPhraseText,
      lang: wordlistLocale,
    };
    try {
      validateSeedPhrase(seedPhrase);
      alert("Done");
    } catch (err) {
      alert(err.message);
    }
  }, [wordlistLocale, seedPhraseText]);

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
                <div className="text-white mb-2 text-lg">Seed Phrase</div>
                <LongTextField
                  value={seedPhraseText}
                  className="mb-16 w-96 h-36 resize-none"
                  onChange={(evt) => setSeedPhraseText(evt.target.value)}
                />
              </div>
              <Button onClick={() => navigateToSelectAccount()}>
                Continue
              </Button>
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
