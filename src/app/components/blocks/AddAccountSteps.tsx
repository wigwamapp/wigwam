import { memo, Suspense, useRef } from "react";
import classNames from "clsx";

import { NextAddAccountStep } from "app/nav";
import { addAccountStepAtomNext } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";

import AddAccountInitial from "../screens/addAccountStepsNext/AddAccountInitial";

import CreateSeedPhrase from "../screens/addAccountStepsNext/CreateSeedPhrase";
import ImportSeedPhrase from "../screens/addAccountStepsNext/ImportSeedPhrase";
import VerifySeedPhrase from "../screens/addAccountStepsNext/VerifySeedPhrase";
import ImportPrivateKey from "../screens/addAccountStepsNext/ImportPrivateKey";
import AddWatchOnlyAccount from "../screens/addAccountStepsNext/AddWatchOnlyAccount";

import ConfirmAccounts from "../screens/addAccountStepsNext/ConfirmAccounts";
import EditAccounts from "../screens/addAccountStepsNext/EditAccounts";
import SetupPassword from "../screens/addAccountStepsNext/SetupPassword";

const ADD_ACCOUNT_STEPS: AllSteps<NextAddAccountStep> = [
  [NextAddAccountStep.AddAccountInitial, () => <AddAccountInitial />],

  [NextAddAccountStep.CreateSeedPhrase, () => <CreateSeedPhrase />],
  [NextAddAccountStep.ImportSeedPhrase, () => <ImportSeedPhrase />],
  [NextAddAccountStep.VerifySeedPhrase, () => <VerifySeedPhrase />],
  [NextAddAccountStep.ImportPrivateKey, () => <ImportPrivateKey />],
  [NextAddAccountStep.AddWatchOnlyAccount, () => <AddWatchOnlyAccount />],

  [NextAddAccountStep.ConfirmAccounts, () => <ConfirmAccounts />],
  [NextAddAccountStep.EditAccounts, () => <EditAccounts />],
  [NextAddAccountStep.SetupPassword, () => <SetupPassword />],
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
        // accountStep === NextAddAccountStep.ChooseWayGeneral ? "pb-16" : "pb-24",
      )}
    >
      <StepsProvider
        rootRef={rootRef}
        atom={addAccountStepAtomNext}
        steps={ADD_ACCOUNT_STEPS}
      >
        {({ children }) => <Suspense fallback={null}>{children}</Suspense>}
      </StepsProvider>
    </div>
  );
});

export default AddAccountStepsNext;
