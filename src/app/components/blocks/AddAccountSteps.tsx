import { memo, Suspense, useCallback, useRef } from "react";
import classNames from "clsx";

import { AddAccountStep } from "app/nav";
import { addAccountStepAtom } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";
import { useDialog } from "app/hooks/dialog";

import { ReactComponent as SupportIcon } from "app/icons/chat.svg";

import * as SupportAlert from "app/components/elements/SupportAlert";

import AddAccountInitial from "../screens/addAccountSteps/AddAccountInitial";
import CreateSeedPhrase from "../screens/addAccountSteps/CreateSeedPhrase";
import ImportSeedPhrase from "../screens/addAccountSteps/ImportSeedPhrase";
import VerifySeedPhrase from "../screens/addAccountSteps/VerifySeedPhrase";
import ImportPrivateKey from "../screens/addAccountSteps/ImportPrivateKey";
import AddWatchOnlyAccount from "../screens/addAccountSteps/AddWatchOnlyAccount";

import ConfirmAccounts from "../screens/addAccountSteps/ConfirmAccounts";
import EditAccounts from "../screens/addAccountSteps/EditAccounts";
import SetupPassword from "../screens/addAccountSteps/SetupPassword";
import Button from "../elements/Button";

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
  const { alert } = useDialog();
  const rootRef = useRef<HTMLDivElement>(null);

  const handleSupport = useCallback(() => {
    alert({ title: <SupportAlert.Title />, content: <SupportAlert.Content /> });
  }, [alert]);

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
      <Button
        theme="clean"
        className="absolute right-8 bottom-5 z-20 font-semibold"
        onClick={handleSupport}
      >
        <SupportIcon className="mr-2" />
        Support
      </Button>
    </div>
  );
});

export default AddAccountStepsNext;
