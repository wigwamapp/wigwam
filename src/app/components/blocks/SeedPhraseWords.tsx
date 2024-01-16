import { memo, useCallback, useState } from "react";
import classNames from "clsx";
import { fromProtectedString, toProtectedString } from "lib/crypto-utils";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { SeedPharse } from "core/types";

import Button from "app/components/elements/Button";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";

type SeedPhraseWordsProps = {
  seedPhrase: SeedPharse;
};

const SeedPhraseWords = memo(({ seedPhrase }: SeedPhraseWordsProps) => {
  const [phraseWords, setPhraseWords] = useState<string[] | null>();

  const isShown = Boolean(phraseWords);
  const handleShow = useCallback(() => {
    const phraseWords = fromProtectedString(seedPhrase.phrase)
      .split(/\s+/g)
      .map(toProtectedString);

    setPhraseWords(phraseWords);
  }, [seedPhrase]);

  const { copy, copied } = useCopyToClipboard();

  const copySeedPhrase = useCallback(() => {
    if (!seedPhrase) return;
    copy(fromProtectedString(seedPhrase.phrase));
  }, [copy, seedPhrase]);

  return (
    <>
      <div
        className={classNames(
          "relative w-full flex flex-wrap",
          "rounded-xl",
          "bg-white bg-opacity-5",
          "p-3",
        )}
      >
        {(phraseWords ?? Array.from({ length: 12 })).map((word, i) => {
          const wordText = word && fromProtectedString(word);
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
                {isShown ? wordText : ""}
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
            isShown ? "opacity-0 pointer-events-none" : "cursor-pointer",
          )}
          onClick={isShown ? undefined : handleShow}
          onKeyDown={isShown ? undefined : handleShow}
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
            copySeedPhrase();
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
  );
});

export default SeedPhraseWords;
