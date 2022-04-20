import { memo, useCallback, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { fromProtectedString } from "lib/crypto-utils";

import {
  AddHDAccountParams,
  AccountSource,
  SeedPharse,
  WalletStatus,
} from "core/types";
import { addSeedPhrase } from "core/client";

import { composeValidators, differentPasswords, required } from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { AddAccountStep } from "app/nav";
import { walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import Input from "app/components/elements/Input";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";

const VerifySeedPhrase = memo(() => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const { alert } = useDialog();

  const initialSetup = walletStatus === WalletStatus.Welcome;

  const { stateRef, reset, navigateToStep } = useSteps();

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  useEffect(() => {
    if (!seedPhrase) {
      reset();
    }
  }, [seedPhrase, reset]);

  const words = useMemo(
    () => (seedPhrase ? fromProtectedString(seedPhrase.phrase).split(" ") : []),
    [seedPhrase]
  );
  const wordsToCheckPositions = useMemo(() => {
    const shuffledPositions = shuffle(range(words.length));
    const selectedPositions: number[] = [];
    for (let i = 0; i < words.length; i++) {
      const newPosition = shuffledPositions[i];
      if (
        selectedPositions.every((selectedPosition) => {
          const distance = Math.abs(selectedPosition - newPosition);
          if (
            [selectedPosition, newPosition].some((position) =>
              [0, words.length - 1].some((edge) => edge === position)
            )
          ) {
            return distance > 2;
          }

          return distance > 2; // was distance > 1
        })
      ) {
        selectedPositions.push(newPosition);
      }
      if (selectedPositions.length === WORDS_TO_FILL) {
        break;
      }
    }

    return selectedPositions.sort((a, b) => a - b);
  }, [words]);

  const handleContinue = useCallback(async () => {
    try {
      if (!seedPhrase) return;

      const addAccountsParams: AddHDAccountParams[] = [
        {
          source: AccountSource.SeedPhrase,
          name: "{{wallet}} 1",
          derivationPath: ethers.utils.defaultPath,
        },
      ];

      Object.assign(stateRef.current, { addAccountsParams });

      if (initialSetup) {
        navigateToStep(AddAccountStep.SetupPassword);
      } else {
        await addSeedPhrase(seedPhrase);
        navigateToStep(AddAccountStep.VerifyToAdd);
      }
    } catch (err: any) {
      alert(err?.message);
    }
  }, [seedPhrase, stateRef, initialSetup, navigateToStep, alert]);

  if (!seedPhrase) {
    return null;
  }

  return (
    <>
      <AddAccountHeader
        className="mb-8"
        description="Fill in the blanks and enter your secret phrase"
      >
        Verify Secret Phrase
      </AddAccountHeader>
      <Form
        onSubmit={handleContinue}
        render={({ handleSubmit, submitting }) => (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-3 gap-y-6 gap-x-9 w-full max-w-[35rem] mx-auto"
          >
            {wordsToCheckPositions.map((indexToFill, i) => (
              <WordsRow key={i} allWords={words} indexToFill={indexToFill} />
            ))}
            <AddAccountContinueButton loading={submitting} />
          </form>
        )}
      />
    </>
  );
});

export default VerifySeedPhrase;

type WordsRowProps = {
  allWords: string[];
  indexToFill: number;
};

const WordsRow = memo<WordsRowProps>(({ allWords, indexToFill }) => {
  const nearIndexes = useMemo(
    () => getTwoNearIndexes(indexToFill, allWords.length),
    [indexToFill, allWords.length]
  );
  const indexes = useMemo(
    () => sortNumbers([indexToFill, ...nearIndexes]),
    [indexToFill, nearIndexes]
  );

  return (
    <>
      {indexes.map((i) => {
        const toFill = i === indexToFill;

        return (
          <div key={i} className="flex items-center">
            <span className="whitespace-nowrap text-base font-bold text-right mr-1.5 block min-w-[1.875rem]">
              {i + 1})
            </span>
            {toFill ? (
              <Field
                name={`word-${indexToFill}`}
                validate={composeValidators(
                  required,
                  differentPasswords(allWords[indexToFill])
                )}
              >
                {({ input, meta }) => (
                  <Input
                    {...input}
                    error={meta.touched && meta.error}
                    success={meta.dirty && !meta.error}
                    successWithIcon
                    readOnly={meta.dirty && !meta.error}
                    inputClassName="max-h-10"
                  />
                )}
              </Field>
            ) : (
              <Input
                readOnly={true}
                defaultValue={allWords[i]}
                success={true}
                successWithIcon
                inputClassName="max-h-10"
              />
            )}
          </div>
        );
      })}
    </>
  );
});

const WORDS_TO_FILL = 2;

const range = (size: number) => {
  return [...Array(size).keys()].map((i) => i + 0);
};

const shuffle = (array: any[]) => {
  const length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = [...array];
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result;
};

const getTwoNearIndexes = (index: number, limit: number) => {
  switch (true) {
    case index === 0:
      return [1, 2];

    case index === limit - 1:
      return [limit - 2, limit - 3];

    default:
      return [index - 1, index + 1];
  }
};

const sortNumbers = (arr: number[]) => {
  return arr.sort((a, b) => a - b);
};
