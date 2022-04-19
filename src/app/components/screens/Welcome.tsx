import { FC, Suspense } from "react";

import { AllSteps, StepsProvider } from "app/hooks/steps";
import { welcomeStepAtom } from "app/atoms";
import { WelcomeStep } from "app/nav";

import LetsBegin from "./welcomeSteps/LetsBegin";

const WELCOME_STEPS: AllSteps<WelcomeStep> = [
  [WelcomeStep.LetsBegin, () => <LetsBegin />],
];

const Welcome: FC = () => (
  <StepsProvider atom={welcomeStepAtom} steps={WELCOME_STEPS}>
    {({ children }) => <Suspense fallback={null}>{children}</Suspense>}
  </StepsProvider>
);

export default Welcome;
