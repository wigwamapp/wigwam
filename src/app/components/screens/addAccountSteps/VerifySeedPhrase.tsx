import { memo, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "clsx";
import { ethers } from "ethers";
import { useAtomValue } from "jotai";
import { fromProtectedString } from "lib/crypto-utils";
import { getRandomInt } from "lib/system/randomInt";

import {
  AccountSource,
  AddHDAccountParams,
  SeedPharse,
  WalletStatus,
} from "core/types";
import { getSeedPhraseHDNode } from "core/common";
import { withHumanDelay } from "app/utils";

import { useDialog } from "app/hooks/dialog";
import { AddAccountStep } from "app/nav";
import { walletStateAtom } from "app/atoms";
import { useNextAccountName } from "app/hooks";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import Button from "app/components/elements/Button";
import { ReactComponent as AlertTriangleIcon } from "app/icons/alert-triangle.svg";
import { ReactComponent as RefreshIcon } from "app/icons/refresh.svg";

const VerifySeedPhrase = memo(() => {
  const { stateRef, reset, navigateToStep } = useSteps();

  const { walletStatus } = useAtomValue(walletStateAtom);
  const { getNextAccountName } = useNextAccountName();
  const { alert, confirm } = useDialog();

  const [selected, setSelected] = useState<number[]>([]);

  const initialSetup = walletStatus === WalletStatus.Welcome;

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  useEffect(() => {
    if (!seedPhrase) {
      reset();
    }
  }, [seedPhrase, reset]);

  const seedPhraseWordsCount = stateRef.current.seedPhraseWordsCount || 12;

  const wordsToCheckIndexes = useMemo(
    () => [
      0,
      ...generateRandomIndexes(
        2,
        seedPhraseWordsCount - 2,
        seedPhraseWordsCount === 12 ? 2 : 4,
      ),
      seedPhraseWordsCount - 1,
    ],
    [seedPhraseWordsCount],
  );

  const [allWordsToDisplay, phraseWordsPartial] = useMemo(() => {
    if (!seedPhrase) return [[], []];

    const phraseWords = fromProtectedString(seedPhrase.phrase).split(/\s+/g);
    const fakeWordsCount = phraseWords.length - wordsToCheckIndexes.length;
    const result = wordsToCheckIndexes.map((i) => phraseWords[i]);

    for (let i = 0; i < fakeWordsCount; i++) {
      let word: string;

      while (true) {
        const fakeIndex = getRandomInt(0, 2043);
        word = ethers.wordlists[seedPhrase.lang].getWord(fakeIndex);

        if (!phraseWords.includes(word)) break;
      }

      result.push(word);
    }

    // Clean unused words
    for (let i = 0; i < seedPhraseWordsCount; i++) {
      if (!wordsToCheckIndexes.includes(i)) {
        delete phraseWords[i];
      }
    }

    return [shuffle(result), phraseWords];
  }, [seedPhrase, wordsToCheckIndexes, seedPhraseWordsCount]);

  const success = useMemo(() => {
    if (selected.length !== wordsToCheckIndexes.length) return null;

    for (let i = 0; i < selected.length; i++) {
      const selectedWord = allWordsToDisplay[selected[i]];
      const targetWord = phraseWordsPartial[wordsToCheckIndexes[i]];

      if (selectedWord !== targetWord) return false;
    }

    return true;
  }, [selected, phraseWordsPartial, wordsToCheckIndexes, allWordsToDisplay]);

  const worlsToCheckDescription = useMemo(
    () =>
      wordsToCheckIndexes.reduce((str, index, i, arr) => {
        if (i === arr.length - 1) str += `, and `;
        else if (i > 0) str += `, `;

        if (index === 0) return `${str}1st`;
        if (index === 1) return `${str}2nd`;
        if (index === 2) return `${str}3rd`;

        return `${str}${index + 1}th`;
      }, ""),
    [wordsToCheckIndexes],
  );

  const handleContinue = useCallback(
    async () =>
      withHumanDelay(async () => {
        try {
          if (!seedPhrase) return;

          if (initialSetup) {
            const addAccountsParams: AddHDAccountParams[] = [
              {
                source: AccountSource.SeedPhrase,
                name: getNextAccountName(),
                derivationPath: ethers.defaultPath,
              },
            ];

            Object.assign(stateRef.current, { addAccountsParams });
            navigateToStep(AddAccountStep.SetupPassword);
          } else {
            const derivationPath = ethers.defaultPath;
            const importAddresses = [
              {
                // Base
                source: AccountSource.SeedPhrase,
                name: getNextAccountName(),
                derivationPath,
                // Misc
                address:
                  getSeedPhraseHDNode(seedPhrase).derivePath(derivationPath)
                    .address,
                index: 0,
                isDisabled: true,
                isDefaultChecked: true,
              },
            ];

            Object.assign(stateRef.current, {
              importAddresses,
              derivationPath: "m/44'/60'/0'/0",
            });
            navigateToStep(AddAccountStep.ConfirmAccounts);
          }
        } catch (err: any) {
          alert({ title: "Error", content: err?.message });
        }
      }),
    [
      seedPhrase,
      initialSetup,
      stateRef,
      navigateToStep,
      getNextAccountName,
      alert,
    ],
  );

  useEffect(() => {
    if (success === true) {
      setTimeout(handleContinue, 1_000);
    }
  }, [success, handleContinue]);

  const handleSkip = useCallback(async () => {
    const confirmed = await confirm({
      title: (
        <>
          Are you sure you want to
          <br />
          skip Seed Phrase verification?
        </>
      ),
      content: (
        <div className={classNames("mb-6 flex items-center")}>
          <AlertTriangleIcon className="w-8 h-auto mr-3 min-w-[2rem]" />
          <p className="text-sm font-medium text-brand-light text-left">
            Your Secret phrase is the
            <br />
            only way to recover your wallet!
          </p>
        </div>
      ),
      yesButtonText: "Yes, skip",
    });

    if (!confirmed) return;

    handleContinue();
  }, [confirm, handleContinue]);

  if (!seedPhrase) {
    return null;
  }

  return (
    <>
      <AddAccountHeader
        className="mb-12"
        description={
          <>
            Select the{" "}
            <span className="text-white">{worlsToCheckDescription}</span> words
            <br />
            in order your Secret phrase displays them
          </>
        }
      >
        Verify Secret Phrase
      </AddAccountHeader>

      <div className="relative w-full mx-auto max-w-md">
        {selected.length > 0 && (
          <Button
            theme="tertiary"
            onClick={() => setSelected([])}
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

        <div
          className={classNames(
            "relative w-full flex flex-wrap",
            "rounded-xl",
            "bg-white bg-opacity-5",
            "p-3",
          )}
        >
          {allWordsToDisplay.map((word, i) => {
            const lastInRow = i % 3 === 2;
            const num = (wordsToCheckIndexes[selected.indexOf(i)] ?? -1) + 1;
            const active = selected.includes(i);

            const handleClick = () => {
              if (!active && selected.length >= wordsToCheckIndexes.length)
                return;

              setSelected((items) =>
                active ? items.filter((j) => i !== j) : [...items, i],
              );
            };

            return (
              <div
                key={i}
                className={classNames(
                  !lastInRow ? "w-[calc(33.3333%-1px)]" : "w-1/3",
                  !lastInRow && "border-r border-brand-main/[.07]",
                  "p-1 flex items-center",
                )}
              >
                <button
                  onClick={handleClick}
                  className={classNames(
                    "w-full p-2 flex items-center",
                    "rounded-xl border-2",
                    !active && "border-transparent hover:border-white/10",
                    active &&
                      (success === false
                        ? "border-brand-redobject"
                        : "border-brand-greenobject"),
                    "transition-colors",
                  )}
                >
                  <span
                    className={classNames(
                      "w-4 text-sm text-brand-inactivedark mr-3 select-none",
                      !active && "invisible",
                    )}
                  >
                    {num > 9 ? num : `0${num}`}
                  </span>
                  <span className="text-sm font-medium text-white">{word}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 w-full flex justify-center">
          <Button
            theme="tertiary"
            onClick={handleSkip}
            className={classNames(
              "text-sm text-brand-light",
              "!py-1 !px-2 !min-w-0",
              "!font-normal",
              "items-center",
              "opacity-50 hover:opacity-90 focus:opacity-90",
            )}
          >
            Skip this
          </Button>
        </div>
      </div>
    </>
  );
});

export default VerifySeedPhrase;

const generateRandomIndexes = (
  from: number,
  to: number,
  toGenerateLegnth: number,
) => {
  if (
    toGenerateLegnth === 0 ||
    from >= to ||
    to - from < toGenerateLegnth * 2 - 1
  ) {
    return [];
  }

  const result: number[] = [];

  while (result.length < toGenerateLegnth) {
    const rand = getRandomInt(from, to);

    if ([rand, rand - 1, rand + 1].some((i) => result.includes(i))) {
      continue;
    }

    result.push(rand);
  }

  return sortNumbers(result);
};

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const sortNumbers = (arr: number[]) => {
  return arr.sort((a, b) => a - b);
};
