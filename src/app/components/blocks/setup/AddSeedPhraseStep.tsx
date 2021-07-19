import { FC, useCallback } from "react";

import { useSteps } from "lib/react-steps";
import { SeedPharse } from "core/types";

import AddSeedPhrase from "../account/AddSeedPhrase";
import ContinueButton from "./ContinueButton";

const AddSeedPhraseStep: FC<{ importExisting?: boolean }> = ({
  importExisting,
}) => {
  const { stateRef, navigateToStep } = useSteps();

  const handleAdded = useCallback(
    (seedPhrase: SeedPharse) => {
      stateRef.current.seedPhrase = seedPhrase;
      navigateToStep(importExisting ? "add-hd-account" : "verify-seed-phrase");
    },
    [navigateToStep, importExisting]
  );

  return (
    <>
      <AddSeedPhrase importExisting={importExisting} onAdd={handleAdded} />
      <ContinueButton />
    </>
  );
};

export default AddSeedPhraseStep;
