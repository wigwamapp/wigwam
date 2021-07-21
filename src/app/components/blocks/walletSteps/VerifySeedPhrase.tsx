import { memo, useCallback, useEffect, useRef } from "react";
import { useSteps } from "lib/react-steps";

import { addSeedPhrase } from "core/client";
import {
  AddHDAccountParams,
  AccountSourceType,
  AccountType,
  SeedPharse,
} from "core/types";

import LongTextField from "app/components/elements/LongTextField";
import Button from "app/components/elements/Button";
import { WalletStep } from "app/defaults";

type VerifySeedPhraseProps = {
  initialSetup?: boolean;
};

const VerifySeedPhrase = memo<VerifySeedPhraseProps>(({ initialSetup }) => {
  const { stateRef, fallbackStep, navigateToStep } = useSteps();

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  useEffect(() => {
    if (!seedPhrase) {
      navigateToStep(fallbackStep);
    }
  }, [seedPhrase, navigateToStep, fallbackStep]);

  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const handleContinue = useCallback(async () => {
    try {
      if (!seedPhrase) return;

      if (fieldRef.current?.value !== seedPhrase.phrase) {
        throw new Error("Invalid");
      }

      if (!initialSetup) {
        await addSeedPhrase(seedPhrase);
        navigateToStep(WalletStep.AddHDAccount);
      } else {
        const addAccountParams: AddHDAccountParams = {
          type: AccountType.HD,
          sourceType: AccountSourceType.SeedPhrase,
          name: "{{wallet}} 1",
          derivationPath: "m/44'/60'/0'/0",
        };

        Object.assign(stateRef.current, { addAccountParams });
        navigateToStep(WalletStep.SetupPassword);
      }
    } catch (err) {
      alert(err.message);
    }
  }, [seedPhrase, initialSetup, stateRef, navigateToStep]);

  if (!seedPhrase) {
    return null;
  }

  return (
    <div className="my-16">
      <h1 className="mb-16 text-3xl text-white text-center">
        {"Verify Seed Phrase"}
      </h1>

      <div className="flex flex-col items-center justify-center">
        <div className="mb-16 flex flex-col items-center justify-center">
          <>
            <div>
              <div className="text-white mb-2 text-lg">Seed Phrase</div>
              <LongTextField
                ref={fieldRef}
                className="mb-16 w-96 h-36 resize-none"
              />
            </div>
            <Button onClick={handleContinue}>Continue</Button>
          </>
        </div>
      </div>
    </div>
  );
});

export default VerifySeedPhrase;
