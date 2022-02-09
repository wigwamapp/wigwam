import { memo, useCallback, useEffect, useRef } from "react";

import { AddAccountParams, SeedPharse } from "core/types";
import { setupWallet } from "core/client";

import { useSteps } from "app/hooks/steps";
import TextField from "app/components/elements/TextField";
import Button from "app/components/elements/Button";
import { useUpdateAtom } from "jotai/utils";
import { addAccountModalAtom } from "app/atoms";

const SetupPassword = memo(() => {
  const setAccModalOpened = useUpdateAtom(addAccountModalAtom);

  const { stateRef, reset } = useSteps();

  const addAccountsParams: AddAccountParams[] | undefined =
    stateRef.current.addAccountsParams;
  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;

  useEffect(() => {
    if (!addAccountsParams) {
      reset();
    }
  }, [addAccountsParams, reset]);

  const passwordFieldRef = useRef<HTMLInputElement>(null);

  const handleFinish = useCallback(async () => {
    try {
      const password = passwordFieldRef.current?.value;

      if (!addAccountsParams || !password) return;

      await setupWallet(password, addAccountsParams, seedPhrase);

      setAccModalOpened([false]);
    } catch (err: any) {
      alert(err?.message);
    }
  }, [addAccountsParams, seedPhrase, setAccModalOpened]);

  if (!addAccountsParams) {
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
