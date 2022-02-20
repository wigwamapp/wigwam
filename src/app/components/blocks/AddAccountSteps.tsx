import { memo, Suspense } from "react";

import { AddAccountStep } from "app/defaults";
import { addAccountStepAtom } from "app/atoms";
import { AllSteps, StepsProvider } from "app/hooks/steps";

import ChooseAddAccountWay from "app/components/blocks/addAccountSteps/ChooseAddAccountWay";
import AddSeedPhrase from "app/components/blocks/addAccountSteps/AddSeedPhrase";
import VerifySeedPhrase from "app/components/blocks/addAccountSteps/VerifySeedPhrase";
import SelectAccountDerivation from "app/components/blocks/addAccountSteps/SelectAccountDerivation";
import AddPrivateKey from "app/components/blocks/addAccountSteps/AddPrivateKey";
import SelectAccountsToAddMethod from "app/components/blocks/addAccountSteps/SelectAccountsToAddMethod";
import VerifyAccountToAdd from "app/components/blocks/addAccountSteps/VerifyAccountToAdd";
import SetupPassword from "app/components/blocks/addAccountSteps/SetupPassword";

const STEPS: AllSteps<AddAccountStep> = [
  [AddAccountStep.ChooseWay, () => <ChooseAddAccountWay />],
  [AddAccountStep.AddSeedPhrase, () => <AddSeedPhrase />],
  [AddAccountStep.VerifySeedPhrase, () => <VerifySeedPhrase />],
  [AddAccountStep.SelectDerivation, () => <SelectAccountDerivation />],
  [AddAccountStep.AddPrivateKey, () => <AddPrivateKey />],
  [
    AddAccountStep.SelectAccountsToAddMethod,
    () => <SelectAccountsToAddMethod />,
  ],
  [AddAccountStep.VerifyToAdd, () => <VerifyAccountToAdd initialSetup />],
  [AddAccountStep.SetupPassword, () => <SetupPassword />],
];

const AddAccountSteps = memo(() => (
  <StepsProvider atom={addAccountStepAtom} steps={STEPS}>
    {({ children }) => (
      <div className="mb-24">
        <Suspense fallback={null}>
          <div className="mt-24">{children}</div>
        </Suspense>
      </div>
    )}
  </StepsProvider>
));

export default AddAccountSteps;
