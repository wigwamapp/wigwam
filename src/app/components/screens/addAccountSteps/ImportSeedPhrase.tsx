import {
  memo,
  useCallback,
  useMemo,
  useState,
  ClipboardEvent,
  useRef,
} from "react";
import classNames from "clsx";
import { toProtectedString } from "lib/crypto-utils";

import { SeedPharse } from "core/types";
import { toWordlistLang } from "core/common";
import { FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import { validateSeedPhrase, withHumanDelay } from "app/utils";
import { formatSeedPhrase } from "app/utils/format";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import Button from "app/components/elements/Button";
import PasswordField from "app/components/elements/PasswordField";
import { ReactComponent as RefreshIcon } from "app/icons/refresh.svg";
import { ReactComponent as FileCheckIcon } from "app/icons/file-check.svg";

import ScanAccountsModal from "./shared/ScanAccountsModal";

const ImportSeedPhrase = memo(() => {
  const { stateRef, navigateToStep } = useSteps();
  const { alert } = useDialog();

  const [wordsCount, setWordsCount] = useState(12);
  const [locale] = useState(FALLBACK_LOCALE);
  const [formStatus, setFormStatus] = useState<
    "success" | "error" | "changed" | null
  >(null);
  const [scanning, setScanning] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const wordlistLocale = useMemo(
    () => toWordlistLang(locale.code),
    [locale.code],
  );

  const isSeedPhraseValid = useCallback(
    (text: string) => validateSeedPhrase(wordlistLocale)(text) === undefined,
    [wordlistLocale],
  );

  const getSeedPhrase = useCallback(() => {
    const form = formRef.current;
    if (!form) return null;

    let phrase = "";
    for (let i = 0; i < wordsCount; i++) {
      const value = (form.elements as any)[`word-${i}`]?.value;
      if (value) phrase += value;
      if (i !== wordsCount - 1) phrase += " ";
    }

    return formatSeedPhrase(phrase);
  }, [wordsCount]);

  const handleContinue = useCallback(
    async () =>
      withHumanDelay(async () => {
        try {
          const text = getSeedPhrase();
          if (!text) return;

          if (!isSeedPhraseValid(text)) {
            throw new Error(
              "Invalid Secret phrase. Please recheck it and try again",
            );
          }

          const seedPhrase: SeedPharse = {
            phrase: toProtectedString(text),
            lang: wordlistLocale,
          };

          stateRef.current.seedPhrase = seedPhrase;
          stateRef.current.derivationPath = "m/44'/60'/0'/0";

          setScanning(true);
        } catch (err: any) {
          setFormStatus("error");
          alert({ title: "Error", content: err?.message });
        }
      }),
    [
      wordlistLocale,
      stateRef,
      alert,
      getSeedPhrase,
      isSeedPhraseValid,
      setFormStatus,
    ],
  );

  const handleInput = useCallback(() => {
    const text = getSeedPhrase();
    setFormStatus(
      !text ? null : isSeedPhraseValid(text) ? "success" : "changed",
    );
  }, [getSeedPhrase, isSeedPhraseValid, setFormStatus]);

  const handlePaste = useCallback(
    (evt: ClipboardEvent<HTMLInputElement>) => {
      try {
        let text = evt.clipboardData.getData("text");
        text = formatSeedPhrase(text);

        const words = text.split(" ");
        if (![12, 24].includes(words.length)) {
          return;
        }

        evt.preventDefault();
        evt.stopPropagation();

        setWordsCount(words.length > 12 ? 24 : 12);

        setTimeout(() => {
          const form = formRef.current;
          if (!form) return;

          for (let i = 0; i < words.length; i++) {
            const el = (form.elements as any)[`word-${i}`];
            if (el) el.value = words[i];
          }

          setFormStatus(isSeedPhraseValid(text) ? "success" : "error");
        }, 100);
      } catch (err: any) {
        alert({ title: "Invalid phrase pasted", content: err?.message });
      }
    },
    [setWordsCount, isSeedPhraseValid, setFormStatus, alert],
  );

  return (
    <>
      <AddAccountHeader
        className="mb-12"
        description="To add a wallet, enter or paste your 12 or 24 word Secret phrase"
      >
        Import Secret Phrase
      </AddAccountHeader>

      <div className="relative w-full mx-auto max-w-xl">
        {formStatus && (
          <Button
            theme="tertiary"
            onClick={() => {
              formRef.current?.reset();
              setFormStatus(null);
            }}
            className={classNames(
              "absolute -top-[2rem] right-0",
              "text-xs text-brand-light",
              "!py-1 !px-2 !min-w-0",
              "!font-normal",
              "flex items-center",
              "opacity-50 hover:opacity-90 focus:opacity-90",
            )}
          >
            <RefreshIcon className="h-3 w-auto mr-1" />
            reset
          </Button>
        )}

        <form
          ref={formRef}
          className={classNames(
            "relative w-full flex flex-wrap",
            "rounded-xl",
            "bg-white bg-opacity-5",
            "p-3",
          )}
          onSubmit={(e) => e.preventDefault()}
        >
          {Array.from({ length: wordsCount }).map((_, i) => {
            const lastInRow = i % 3 === 2;
            const num = i + 1;

            return (
              <div
                key={i}
                className={classNames(
                  "relative",
                  !lastInRow ? "w-[calc(33.3333%-1px)]" : "w-1/3",
                  !lastInRow && "border-r border-brand-main/[.07]",
                  "py-1 px-2 flex items-center",
                )}
              >
                <PasswordField
                  className="w-full"
                  inputClassName="p-2 pl-8 rounded-xl"
                  name={`word-${i}`}
                  text="word"
                  onPaste={handlePaste}
                  onInput={handleInput}
                  success={formStatus === "success"}
                  error={formStatus === "error"}
                />

                <div
                  className={classNames(
                    "absolute",
                    "left-0 top-0 bottom-0",
                    "flex items-center pl-4",
                  )}
                >
                  <span
                    className={classNames(
                      "w-4 text-sm text-brand-inactivedark select-none",
                    )}
                  >
                    {num > 9 ? num : `0${num}`}
                  </span>
                </div>
              </div>
            );
          })}
        </form>

        <div className="mt-5 w-full flex flex-col items-center justify-center">
          <Button
            theme="tertiary"
            onClick={() => {
              formRef.current?.reset();
              setWordsCount((c) => (c === 12 ? 24 : 12));
              setFormStatus(null);
            }}
            className={classNames(
              "text-sm text-brand-light",
              "!py-1 !px-2 !min-w-0",
              "!font-normal",
              "items-center",
              "opacity-50 hover:opacity-90 focus:opacity-90",
            )}
          >
            I’m using {wordsCount === 12 ? 24 : 12} words Secret Phrase
          </Button>

          <div
            className={classNames(
              "h-px w-full mx-auto max-w-[10rem]",
              "my-1.5 bg-brand-main/[.07]",
            )}
          />

          <Button
            theme="tertiary"
            onClick={() => {
              navigateToStep(AddAccountStep.ImportPrivateKey);
            }}
            className={classNames(
              "text-sm text-brand-light",
              "!py-1 !px-2 !min-w-0",
              "!font-normal",
              "items-center",
              "opacity-50 hover:opacity-90 focus:opacity-90",
            )}
          >
            Import Private Key
          </Button>
        </div>
      </div>

      <AddAccountContinueButton onContinue={handleContinue}>
        <FileCheckIcon className="h-6 w-auto mr-2" />
        Import wallets
      </AddAccountContinueButton>

      {scanning && (
        <ScanAccountsModal onOpenChange={() => setScanning(false)} />
      )}
    </>
  );
});

export default ImportSeedPhrase;
