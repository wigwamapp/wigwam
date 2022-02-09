import { FC, Suspense } from "react";

import { AllSteps, StepsProvider } from "app/hooks/steps";
import { welcomeStepAtom } from "app/atoms";
import { WelcomeStep } from "app/defaults";

import LetsBegin from "../blocks/welcomeSteps/LetsBegin";
import ChooseLanguage from "../blocks/welcomeSteps/ChooseLanguage";
import Hello from "../blocks/welcomeSteps/Hello";

const STEPS: AllSteps<WelcomeStep> = [
  [WelcomeStep.Hello, () => <Hello />],
  [WelcomeStep.ChooseLanguage, () => <ChooseLanguage />],
  [WelcomeStep.LetsBegin, () => <LetsBegin />],
];

const Welcome: FC = () => (
  <StepsProvider atom={welcomeStepAtom} steps={STEPS}>
    {({ children }) => <Suspense fallback={null}>{children}</Suspense>}
  </StepsProvider>
);

export default Welcome;
