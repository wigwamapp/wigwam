import { memo, Suspense, useRef } from "react";
import { useAtomValue } from "jotai/utils";
import classNames from "clsx";

import { AddAccountStep } from "app/nav";
import { addAccountStepAtom } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";

import ChooseAddAccountWay from "../screens/addAccountSteps/ChooseAddAccountWay";
import AddSeedPhrase from "../screens/addAccountSteps/AddSeedPhrase";
import VerifySeedPhrase from "../screens/addAccountSteps/VerifySeedPhrase";
import SelectAccountDerivation from "../screens/addAccountSteps/SelectAccountDerivation";
import AddPrivateKey from "../screens/addAccountSteps/AddPrivateKey";
import SelectAccountsToAddMethod from "../screens/addAccountSteps/SelectAccountsToAddMethod";
import VerifyAccountToAdd from "../screens/addAccountSteps/VerifyAccountToAdd";
import SetupPassword from "../screens/addAccountSteps/SetupPassword";

const ADD_ACCOUNT_STEPS: AllSteps<AddAccountStep> = [
  [AddAccountStep.ChooseWay, () => <ChooseAddAccountWay />],
  [AddAccountStep.AddSeedPhrase, () => <AddSeedPhrase />],
  [AddAccountStep.VerifySeedPhrase, () => <VerifySeedPhrase />],
  [AddAccountStep.SelectDerivation, () => <SelectAccountDerivation />],
  [AddAccountStep.AddPrivateKey, () => <AddPrivateKey />],
  [
    AddAccountStep.SelectAccountsToAddMethod,
    () => <SelectAccountsToAddMethod />,
  ],
  [AddAccountStep.VerifyToAdd, () => <VerifyAccountToAdd />],
  [AddAccountStep.SetupPassword, () => <SetupPassword />],
];

const AddAccountSteps = memo(() => {
  const accountStep = useAtomValue(addAccountStepAtom);
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rootRef} className="overflow-y-scroll h-full">
      <StepsProvider
        rootRef={rootRef}
        atom={addAccountStepAtom}
        steps={ADD_ACCOUNT_STEPS}
      >
        {({ children }) => (
          <div
            className={classNames(
              accountStep === AddAccountStep.ChooseWay ? "mb-16" : "mb-24"
            )}
          >
            <Suspense fallback={null}>
              <div className="mt-24">{children}</div>
            </Suspense>
          </div>
        )}
      </StepsProvider>
    </div>
  );
});

export default AddAccountSteps;
