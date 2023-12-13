import { memo, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "clsx";
import { ethers } from "ethers";
import { getRandomBytes, toProtectedString } from "lib/crypto-utils";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { SeedPharse } from "core/types";
import { toWordlistLang, validateSeedPhrase } from "core/common";
import { FALLBACK_LOCALE } from "fixtures/locales";

import { AddAccountStep } from "app/nav";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import Button from "app/components/elements/Button";
import { ReactComponent as BookmarkCheckIcon } from "app/icons/bookmark-check.svg";
import { ReactComponent as PencilLineIcon } from "app/icons/pencil-line.svg";
import { ReactComponent as AlertTriangleIcon } from "app/icons/alert-triangle.svg";
import { ReactComponent as ShieldOffIcon } from "app/icons/shield-off.svg";
import { ReactComponent as EyeOffIcon } from "app/icons/eye-off.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";

const { toBeArray, dataSlice, keccak256, concat } = ethers;

const WORDS_LIST = [12, 24].map((count) => ({
  key: count,
  value: count.toString(),
}));

const CreateSeedPhrase = memo(() => {
  const { stateRef, navigateToStep } = useSteps();

  const [locale] = useState(FALLBACK_LOCALE);
  const [wordsCount] = useState(WORDS_LIST[0]);
  const [seedPhraseText, setSeedPhraseField] = useState("");
  const [isShown, setIsShown] = useState(false);

  const { copy, copied } = useCopyToClipboard(seedPhraseText);
  const { alert } = useDialog();

  const phraseWords = useMemo(
    () => seedPhraseText.split(" ").filter(Boolean),
    [seedPhraseText],
  );

  const wordlistLocale = useMemo(
    () => toWordlistLang(locale.code),
    [locale.code],
  );

  const handleContinue = useCallback(async () => {
    try {
      if (!seedPhraseText) {
        throw new Error("Not a valid secret phrase");
      }

      const seedPhrase: SeedPharse = {
        phrase: toProtectedString(seedPhraseText),
        lang: wordlistLocale,
      };

      validateSeedPhrase(seedPhrase);

      stateRef.current.seedPhrase = seedPhrase;
      stateRef.current.seedPhraseLocale = wordlistLocale;

      navigateToStep(AddAccountStep.VerifySeedPhrase);
    } catch (err: any) {
      alert({ title: "Error", content: err?.message });
    }
  }, [seedPhraseText, wordlistLocale, stateRef, navigateToStep, alert]);

  const generateNew = useCallback(() => {
    const entropySize = wordsCount.value === "12" ? 16 : 32;
    const baseEntropy = getRandomBytes(entropySize);
    const extraEntropy = getRandomBytes(entropySize);

    const entropy = toBeArray(
      dataSlice(keccak256(concat([baseEntropy, extraEntropy])), 0, entropySize),
    );

    const { phrase } = ethers.Mnemonic.fromEntropy(
      entropy,
      null,
      ethers.wordlists[wordlistLocale],
    );

    setSeedPhraseField(phrase);
  }, [wordlistLocale, wordsCount]);

  useEffect(() => {
    setTimeout(generateNew, 0);
  }, [generateNew]);

  return (
    <>
      <AddAccountHeader className="mb-12">Secret Phrase</AddAccountHeader>

      <div
        className={classNames("w-full mx-auto max-w-4xl", "flex items-stretch")}
      >
        <div className="w-5/12 px-8 select-none">
          {CONTENT_ITEMS.map(({ Icon, text }, i) => (
            <div key={i} className={classNames("mb-10 flex items-center")}>
              <Icon className="w-8 h-auto mr-3 min-w-[2rem]" />
              <p className="text-sm font-medium text-brand-light">{text}</p>
            </div>
          ))}
        </div>
        <div className="w-7/12 px-8">
          {phraseWords.length > 0 && (
            <>
              <div
                className={classNames(
                  "relative w-full flex flex-wrap",
                  "rounded-xl",
                  "bg-white bg-opacity-5",
                  "p-3",
                )}
              >
                {phraseWords.map((word, i) => {
                  const lastInRow = i % 3 === 2;
                  const num = i + 1;

                  return (
                    <div
                      key={i}
                      className={classNames(
                        !lastInRow ? "w-[calc(33.3333%-1px)]" : "w-1/3",
                        !lastInRow && "border-r border-brand-main/[.07]",
                        "py-3 pl-5 pr-3 flex items-center",
                        !isShown && "blur-sm",
                      )}
                    >
                      <span className="w-4 text-sm text-brand-inactivedark mr-3 select-none">
                        {num > 9 ? num : `0${num}`}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {isShown ? word : ""}
                      </span>
                    </div>
                  );
                })}

                <div
                  className={classNames(
                    "absolute z-10",
                    "inset-0 box-border",
                    "rounded-[.5625rem]",
                    "bg-[#1E2C31] bg-opacity-75",
                    "border border-brand-main/10",
                    "flex flex-col items-center justify-center",
                    "transition-opacity",
                    isShown
                      ? "opacity-0 pointer-events-none"
                      : "cursor-pointer",
                  )}
                  onClick={isShown ? undefined : () => setIsShown(true)}
                  onKeyDown={isShown ? undefined : () => setIsShown(true)}
                >
                  <OpenedEyeIcon className="w-[2.125rem] h-auto" />
                  <span className="text-xs font-semibold mt-2 text-center">
                    Click here to reveal
                    <br />a Secret Phrase
                  </span>
                </div>
              </div>

              <div className="mt-5 w-full flex justify-center">
                <Button
                  theme="tertiary"
                  onClick={(evt: any) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    copy();
                  }}
                  className={classNames(
                    "text-sm text-brand-light",
                    "!py-1 !px-2 !min-w-0",
                    "!font-normal",
                    "items-center",
                    copied ? "opacity-90" : "opacity-50",
                    "hover:opacity-90 focus:opacity-90",
                  )}
                >
                  {copied ? (
                    <SuccessIcon className="mr-1" />
                  ) : (
                    <CopyIcon className="mr-1" />
                  )}
                  {copied ? "Copied" : "Copy to clipboard"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <AddAccountContinueButton onContinue={handleContinue}>
        <BookmarkCheckIcon className="h-6 w-auto mr-2" />
        I’ve saved the phrase
      </AddAccountContinueButton>
    </>
  );
});

export default CreateSeedPhrase;

const CONTENT_ITEMS = [
  {
    Icon: PencilLineIcon,
    text: "Write down and store your Secret phrase in the a safe place",
  },
  {
    Icon: AlertTriangleIcon,
    text: "Your Secret phrase is the only way to recover your wallet",
  },
  {
    Icon: ShieldOffIcon,
    text: "Anyone with your Secret phrase can get full access to your wallet and funds",
  },
  {
    Icon: EyeOffIcon,
    text: "Never share your Secret phrase with anyone. Your wallet's security depends on keeping this detail private",
  },
] as const;
