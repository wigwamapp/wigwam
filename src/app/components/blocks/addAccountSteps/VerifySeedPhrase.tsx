import { memo, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useAtomValue } from "jotai/utils";
import { fromProtectedString } from "lib/crypto-utils";

import {
  AddHDAccountParams,
  AccountSource,
  SeedPharse,
  WalletStatus,
} from "core/types";
import { addSeedPhrase } from "core/client";

import LongTextField from "app/components/elements/LongTextField";
import Button from "app/components/elements/Button";
import { useSteps } from "app/hooks/steps";
import { AddAccountStep } from "app/defaults";
import { walletStatusAtom } from "app/atoms";

const VerifySeedPhrase = memo(() => {
  const walletStatus = useAtomValue(walletStatusAtom);

  const initialSetup = walletStatus === WalletStatus.Welcome;

  const { stateRef, reset, navigateToStep } = useSteps();

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  useEffect(() => {
    if (!seedPhrase) {
      reset();
    }
  }, [seedPhrase, reset]);

  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const handleContinue = useCallback(async () => {
    try {
      if (!seedPhrase) return;

      if (fieldRef.current?.value !== fromProtectedString(seedPhrase.phrase)) {
        throw new Error("Invalid");
      }

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
