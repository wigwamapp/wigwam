import { memo, useCallback, useEffect, useRef } from "react";
import { useSteps } from "lib/react-steps";

import { AddAccountParams, SeedPharse } from "core/types";

import * as Actions from "app/actions";
import TextField from "app/components/elements/TextField";
import Button from "app/components/elements/Button";

const SetupPassword = memo(() => {
  const { stateRef, fallbackStep, navigateToStep } = useSteps();

  const addAccountParams: AddAccountParams | undefined =
    stateRef.current.addAccountParams;
  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;

  useEffect(() => {
    if (!addAccountParams) {
      navigateToStep(fallbackStep);
    }
  }, [addAccountParams, navigateToStep, fallbackStep]);

  const passwordFieldRef = useRef<HTMLInputElement>(null);

  const handleFinish = useCallback(async () => {
    try {
      const password = passwordFieldRef.current?.value;

      if (!addAccountParams || !password) return;

      const accounts = [addAccountParams];
      await Actions.setupWallet(password, accounts, seedPhrase);
    } catch (err) {
      alert(err.message);
    }
  }, [addAccountParams, seedPhrase]);

  if (!addAccountParams) {
    return null;
  }

  return (
    <div className="my-16">
      <h1 className="mb-16 text-3xl text-white text-center">
        {"Setup Password"}
      </h1>

      <div className="mb-16 flex flex-col items-center justify-center">
        <div>
          <div className="text-white mb-2 text-lg">Password</div>
          <TextField
            ref={passwordFieldRef}
            type="password"
            placeholder="******"
            className="mb-8 w-96"
          />
        </div>

        <div>
          <div className="text-white mb-2 text-lg">Confirm Password</div>
          <TextField
            type="password"
            placeholder="******"
            className="mb-16 w-96"
          />
        </div>

        <Button onClick={handleFinish}>Finish</Button>
      </div>
    </div>
  );
});

export default SetupPassword;
