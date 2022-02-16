import { memo, useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAtomValue } from "jotai";
import { fromProtectedString } from "lib/crypto-utils";

import {
  AddHDAccountParams,
  AccountSource,
  SeedPharse,
  WalletStatus,
} from "core/types";
import { addSeedPhrase } from "core/client";

import { AddAccountStep } from "app/defaults";
import { walletStatusAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";

const VerifySeedPhrase = memo(() => {
  const walletStatus = useAtomValue(walletStatusAtom);

  const initialSetup = walletStatus === WalletStatus.Welcome;

  const { stateRef, reset, navigateToStep } = useSteps();

  const [inputSeedPhrase, setInputSeedPhrase] = useState("");

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  useEffect(() => {
    if (!seedPhrase) {
      reset();
    }
  }, [seedPhrase, reset]);

  const handleContinue = useCallback(async () => {
    try {
      if (!seedPhrase) return;

      if (inputSeedPhrase !== fromProtectedString(seedPhrase.phrase)) {
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
  }, [seedPhrase, inputSeedPhrase, stateRef, initialSetup, navigateToStep]);

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

      <div className="flex flex-col max-w-[27.5rem] mx-auto">
        <SeedPhraseField
          value={inputSeedPhrase}
          onChange={(evt) => setInputSeedPhrase(evt.target.value)}
          placeholder="Paste there your secret phrase"
          mode={"import"}
        />
      </div>

      <AddAccountContinueButton onContinue={handleContinue} />
    </>
  );
});

export default VerifySeedPhrase;
