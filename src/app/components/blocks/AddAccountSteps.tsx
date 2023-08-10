import { memo, Suspense, useRef } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { AddAccountStep } from "app/nav";
import { addAccountStepAtom } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";

import ChooseAddAccountWay from "../screens/addAccountSteps/ChooseAddAccountWay";
import VerifySeedPhrase from "../screens/addAccountSteps/VerifySeedPhrase";
import SelectAccountsToAddMethod from "../screens/addAccountSteps/SelectAccountsToAddMethod";
import VerifyAccountToAdd from "../screens/addAccountSteps/VerifyAccountToAdd";
import SetupPassword from "../screens/addAccountSteps/SetupPassword";
import CreateSeedPhrase from "../screens/addAccountSteps/CreateSeedPhrase";
import ImportSeedPhrase from "../screens/addAccountSteps/ImportSeedPhrase";
import ImportPrivateKey from "../screens/addAccountSteps/ImportPrivateKey";
import AddWatchOnlyAccount from "../screens/addAccountSteps/AddWatchOnlyAccount";

const ADD_ACCOUNT_STEPS: AllSteps<AddAccountStep> = [
  [AddAccountStep.ChooseWay, () => <ChooseAddAccountWay />],
  [AddAccountStep.CreateSeedPhrase, () => <CreateSeedPhrase />],
  [AddAccountStep.ImportSeedPhrase, () => <ImportSeedPhrase />],
  [AddAccountStep.ImportPrivateKey, () => <ImportPrivateKey />],
  [AddAccountStep.AddWatchOnlyAccount, () => <AddWatchOnlyAccount />],
  [AddAccountStep.VerifySeedPhrase, () => <VerifySeedPhrase />],
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
        "w-[59rem] mx-auto",
        "h-full",
        "pt-24",
        "flex flex-col",
        accountStep === AddAccountStep.ChooseWay ? "pb-16" : "pb-24",
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
