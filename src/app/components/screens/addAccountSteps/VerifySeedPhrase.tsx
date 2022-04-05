import { memo, useCallback, useEffect } from "react";
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

import {
  composeValidators,
  differentSeedPhrase,
  required,
  validateSeedPhrase,
} from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { AddAccountStep } from "app/nav";
import { walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";

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

  const handleContinue = useCallback(
    async (values) => {
      try {
        if (!seedPhrase) return;

        const inputSeedPhrase = values.seed;

        if (inputSeedPhrase !== fromProtectedString(seedPhrase.phrase)) return;

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
    },
    [seedPhrase, stateRef, initialSetup, navigateToStep, alert]
  );

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
        render={({ form, handleSubmit, submitting }) => (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-[27.5rem] mx-auto"
          >
            <Field
              name="seed"
              validate={composeValidators(
                required,
                validateSeedPhrase(stateRef.current.seedPhraseLocale),
                differentSeedPhrase(fromProtectedString(seedPhrase.phrase))
              )}
            >
              {({ input, meta }) => (
                <SeedPhraseField
                  placeholder="Paste there your secret phrase"
                  setFromClipboard={(value) => form.change("seed", value)}
                  error={meta.touched && meta.error}
                  errorMessage={meta.error}
                  {...input}
                />
              )}
            </Field>
            <AddAccountContinueButton loading={submitting} />
          </form>
        )}
      />
    </>
  );
});

export default VerifySeedPhrase;
