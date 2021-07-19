import { FC, Suspense } from "react";

import { AllSteps, StepsProvider } from "lib/react-steps";
import { SetupStep } from "app/defaults";

import BoardingPageLayout from "../layouts/BoardingPageLayout";
import LanguageStep from "../blocks/setup/LanguageStep";
import ChooseAddAccountWay from "../blocks/setup/ChooseAddAccountWay";
import AddSeedPhraseStep from "../blocks/setup/AddSeedPhraseStep";
import AddHDAccountStep from "../blocks/setup/AddHDAccountStep";
import VerifySeedPhraseStep from "../blocks/setup/VerifySeedPhraseStep";

const STEPS: AllSteps<SetupStep> = [
  [SetupStep.Language, () => <LanguageStep />],
  [SetupStep.ChooseAddAccountWay, () => <ChooseAddAccountWay />],
  [SetupStep.CreateSeedPhrase, () => <AddSeedPhraseStep />],
  [SetupStep.ImportSeedPhrase, () => <AddSeedPhraseStep importExisting />],
  [SetupStep.VerifySeedPhrase, () => <VerifySeedPhraseStep />],
  [SetupStep.AddHDAccount, () => <AddHDAccountStep />],
];

const Setup: FC = () => (
  <StepsProvider namespace="setup" steps={STEPS} fallback="language">
    {({ stepId, children }) => (
      <BoardingPageLayout key={stepId} title={null}>
        <div className="mb-24">
          <Suspense fallback={null}>
            <div className="mt-12">{children}</div>
          </Suspense>
        </div>
      </BoardingPageLayout>
    )}
  </StepsProvider>
);

export default Setup;
