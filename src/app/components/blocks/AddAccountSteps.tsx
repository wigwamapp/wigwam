import { memo, Suspense } from "react";

import { AllSteps, StepsProvider } from "app/hooks/steps";
import { addAccountStepAtom } from "app/atoms";
import { AddAccountStep } from "app/defaults";

import ChooseAddAccountWay from "../blocks/addAccountSteps/ChooseAddAccountWay";
import AddSeedPhrase from "../blocks/addAccountSteps/AddSeedPhrase";
import VerifySeedPhrase from "../blocks/addAccountSteps/VerifySeedPhrase";
import SelectAccountDerivation from "../blocks/addAccountSteps/SelectAccountDerivation";
import AddPrivateKey from "../blocks/addAccountSteps/AddPrivateKey";
import VerifyAccountToAdd from "../blocks/addAccountSteps/VerifyAccountToAdd";
import SetupPassword from "../blocks/addAccountSteps/SetupPassword";

const STEPS: AllSteps<AddAccountStep> = [
  [AddAccountStep.ChooseWay, () => <ChooseAddAccountWay />],
  [AddAccountStep.AddSeedPhrase, () => <AddSeedPhrase />],
  [AddAccountStep.VerifySeedPhrase, () => <VerifySeedPhrase />],
  [AddAccountStep.SelectDerivation, () => <SelectAccountDerivation />],
  [AddAccountStep.AddPrivateKey, () => <AddPrivateKey />],
  [AddAccountStep.VerifyToAdd, () => <VerifyAccountToAdd />],
  [AddAccountStep.SetupPassword, () => <SetupPassword />],
];

const AddAccountSteps = memo(() => (
  <StepsProvider atom={addAccountStepAtom} steps={STEPS}>
    {({ children }) => (
      <div className="mb-24">
        <Suspense fallback={null}>
          <div className="mt-12">{children}</div>
        </Suspense>
      </div>
    )}
  </StepsProvider>
));

export default AddAccountSteps;
