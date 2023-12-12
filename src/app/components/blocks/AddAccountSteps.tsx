import { memo, Suspense, useRef } from "react";
import classNames from "clsx";

import { AddAccountStep } from "app/nav";
import { addAccountStepAtom } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";

import AddAccountInitial from "../screens/addAccountSteps/AddAccountInitial";

import CreateSeedPhrase from "../screens/addAccountSteps/CreateSeedPhrase";
import ImportSeedPhrase from "../screens/addAccountSteps/ImportSeedPhrase";
import VerifySeedPhrase from "../screens/addAccountSteps/VerifySeedPhrase";
import ImportPrivateKey from "../screens/addAccountSteps/ImportPrivateKey";
import AddWatchOnlyAccount from "../screens/addAccountSteps/AddWatchOnlyAccount";

import ConfirmAccounts from "../screens/addAccountSteps/ConfirmAccounts";
import EditAccounts from "../screens/addAccountSteps/EditAccounts";
import SetupPassword from "../screens/addAccountSteps/SetupPassword";

const ADD_ACCOUNT_STEPS: AllSteps<AddAccountStep> = [
  [AddAccountStep.AddAccountInitial, () => <AddAccountInitial />],

  [AddAccountStep.CreateSeedPhrase, () => <CreateSeedPhrase />],
  [AddAccountStep.ImportSeedPhrase, () => <ImportSeedPhrase />],
  [AddAccountStep.VerifySeedPhrase, () => <VerifySeedPhrase />],
  [AddAccountStep.ImportPrivateKey, () => <ImportPrivateKey />],
  [AddAccountStep.AddWatchOnlyAccount, () => <AddWatchOnlyAccount />],

  [AddAccountStep.ConfirmAccounts, () => <ConfirmAccounts />],
  [AddAccountStep.EditAccounts, () => <EditAccounts />],
  [AddAccountStep.SetupPassword, () => <SetupPassword />],
];

const AddAccountStepsNext = memo(() => {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      className={classNames(
        "w-[59rem] mx-auto",
        "h-full",
        "py-24",
        "flex flex-col",
        // accountStep === AddAccountStep.ChooseWayGeneral ? "pb-16" : "pb-24",
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

export default AddAccountStepsNext;
