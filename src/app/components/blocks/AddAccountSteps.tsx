import { memo, Suspense, useRef } from "react";
import { useAtomValue } from "jotai/utils";
import classNames from "clsx";

import { AddAccountStep } from "app/nav";
import { addAccountStepAtom } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";

import ChooseAddAccountWay from "../screens/addAccountSteps/ChooseAddAccountWay";
import VerifySeedPhrase from "../screens/addAccountSteps/VerifySeedPhrase";
import SelectAccountDerivation from "../screens/addAccountSteps/SelectAccountDerivation";
import AddPrivateKey from "../screens/addAccountSteps/AddPrivateKey";
import SelectAccountsToAddMethod from "../screens/addAccountSteps/SelectAccountsToAddMethod";
import VerifyAccountToAdd from "../screens/addAccountSteps/VerifyAccountToAdd";
import SetupPassword from "../screens/addAccountSteps/SetupPassword";
import CreateSeedPhrase from "../screens/addAccountSteps/CreateSeedPhrase";
import ImportSeedPhrase from "../screens/addAccountSteps/ImportSeedPhrase";

const ADD_ACCOUNT_STEPS: AllSteps<AddAccountStep> = [
  [AddAccountStep.ChooseWay, () => <ChooseAddAccountWay />],
  [AddAccountStep.CreateSeedPhrase, () => <CreateSeedPhrase />],
  [AddAccountStep.ImportSeedPhrase, () => <ImportSeedPhrase />],
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
    <div
      ref={rootRef}
      className={classNames(
        "max-w-[59rem] mx-auto",
        "h-full",
        "pt-24",
        "flex flex-col",
        accountStep === AddAccountStep.ChooseWay ? "pb-16" : "pb-24"
      )}
    >
      <StepsProvider
        rootRef={rootRef}
        atom={addAccountStepAtom}
        steps={ADD_ACCOUNT_STEPS}
      >
        {({ children }) => <Suspense fallback={null}>{children}</Suspense>}
      </StepsProvider>
    </div>
  );
});

export default AddAccountSteps;
