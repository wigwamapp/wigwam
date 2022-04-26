import { ChangeEvent, memo, useCallback, useEffect, useMemo } from "react";
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

import { composeValidators, required } from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { AddAccountStep } from "app/nav";
import { walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import Input from "app/components/elements/Input";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";

const WORDS_TO_FILL = 6;

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
  const wordsToCheckPositions = useMemo(
    () => shuffle(range(words.length)),
    [words]
  );

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

      navigateToStep(
        initialSetup ? AddAccountStep.SetupPassword : AddAccountStep.VerifyToAdd
      );
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
        description="Fill in the empty fields with words according to their serial number"
      >
        Verify Secret Phrase
      </AddAccountHeader>
      <Form
        onSubmit={handleContinue}
        render={({ handleSubmit, submitting }) => (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-3 gap-y-6 gap-x-9 w-full max-w-[35rem] mx-auto pt-8"
          >
            {wordsToCheckPositions.map((indexToFill, i) => (
              <div key={indexToFill} className="flex items-center">
                <span className="whitespace-nowrap text-base font-bold text-right mr-1.5 block min-w-[1.875rem]">
                  {indexToFill + 1})
                </span>
                <Field
                  name={`word-${indexToFill}`}
                  validate={composeValidators(
                    required,
                    validateWord(words[indexToFill])
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
                      onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                        const { value } = evt.target;
                        if (value === words[indexToFill] && words[i + 1]) {
                          focusByName(`word-${wordsToCheckPositions[i + 1]}`);
                        }
                        input.onChange(evt);
                      }}
                    />
                  )}
                </Field>
              </div>
            ))}
            <AddAccountContinueButton loading={submitting} />
          </form>
        )}
      />
    </>
  );
});

export default VerifySeedPhrase;

const shuffle = (array: any[]) => {
  const length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = [];
  while (++index < WORDS_TO_FILL) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = array[rand];
    array[rand] = array[index];
    array[index] = value;
    result.push(value);
  }
  return sortNumbers(result);
};

const range = (size: number) => {
  return [...Array(size).keys()];
};

const sortNumbers = (arr: number[]) => {
  return arr.sort((a, b) => a - b);
};

const focusByName = (fieldName: string) => {
  const elem = document.querySelector(`[name='${fieldName}']`);
  return (
    elem &&
    elem.tagName.toLowerCase() === "input" &&
    (elem as HTMLInputElement).focus()
  );
};

const validateWord = (word: string) => (value: string) =>
  value !== word ? "Error" : undefined;
