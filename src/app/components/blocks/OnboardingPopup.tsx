import { FC, useCallback, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtomValue, useSetAtom } from "jotai";

import { onboardingPopupAtom } from "app/atoms";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Button from "app/components/elements/Button";
import OnboardingFirstImage from "app/images/onboarding_first.png";
import OnboardingSecondImage from "app/images/onboarding_second.png";
import OnboardingThirdImage from "app/images/onboarding_third.png";
import WigwamLogoImage from "app/images/wigwam.png";

type TStepContent = {
  title: string;
  description: string;
  image: string;
};

const stepsContent: TStepContent[] = [
  {
    title: "Trade and explore",
    description:
      "Instantly trade over 2,500 tokens, connect with hundreds of dApps, and create or sell NFTs in the Web3 world, all through Wigwam",
    image: OnboardingFirstImage,
  },
  {
    title: "Easy access",
    description:
      "If you can't find a Wigwam button when connecting to a dApp, you can effortlessly connect to Wigwam using MetaMask button instead, as this option is automatically available",
    image: OnboardingSecondImage,
  },
  {
    title: "Always near",
    description:
      "Pin the Wigwam extension on your browser toolbar for fast access to your tokens and to navigate the Web3 space more efficiently",
    image: OnboardingThirdImage,
  },
];

const OnboardingPopup: FC = () => {
  const visible = useAtomValue(onboardingPopupAtom);

  return visible ? <OnBoardingContent /> : null;
};

export default OnboardingPopup;

const OnBoardingContent: FC = () => {
  const setVisible = useSetAtom(onboardingPopupAtom);
  const [step, setStep] = useState(0);

  const handleNext = useCallback(() => {
    if (step === 2) {
      setVisible(false);
    } else {
      setStep((prev) => prev + 1);
    }
  }, [setVisible, step]);

  return (
    <div
      className={classNames(
        "fixed inset-0 z-[999999999999] bg-[#141414] flex flex-col items-center w-full",
        "p-6 pt-10 h-full",
      )}
    >
      <ScrollAreaContainer className="w-full h-full flex flex-col relative max-w-7xl">
        <section className="mb-6 flex flex-col items-center">
          <img
            className="mb-6 w-11 h-11 rounded-md"
            src={WigwamLogoImage}
            alt="wigwam_logo"
          />
          <h3 className="mb-6 text-[1.75rem] font-bold text-center">
            Welcome to Wigwam:
            <br />
            Your Gateway to the Web3 World!
          </h3>
          <Stepper step={step} />
        </section>
        <ul className="mb-16 px-16 flex overflow-hidden">
          <StepContent step={0} current={step} />
          <StepContent step={1} current={step} />
          <StepContent step={2} current={step} />
        </ul>
        <section className="px-16 flex justify-center items-center w-full gap-6">
          <Button
            className={classNames(
              "!ml-10",
              "!font-semibold !text-[#93ACAF]",
              "visible",
            )}
            theme="clean"
            onClick={
              step === 0
                ? () => setVisible(false)
                : () => setStep((prev) => prev - 1)
            }
          >
            {step === 0 ? "Skip" : "Back"}
          </Button>

          <Button onClick={handleNext}>
            {step === 2 ? "Start my journey" : "Next"}
          </Button>
        </section>
      </ScrollAreaContainer>
    </div>
  );
};

const StepContent: FC<{ step: number; current: number }> = ({
  step,
  current,
}) => {
  const isActive = useMemo(() => {
    return step === current;
  }, [step, current]);

  return (
    <li
      className={classNames(
        "px-16 w-full min-w-full items-center grid grid-cols-1 gap-y-6 gap-x-12",
        "md:grid-cols-2 md:gap-y-0",
        "transition-all duration-300",
        !isActive ? (current > step ? "-ml-[100%]" : "mr-[100%]") : undefined,
      )}
    >
      <div>
        <h6 className="mb-2 text-2xl font-bold">{stepsContent[step].title}</h6>
        <p className="max-w-md font-semibold text-[#F8F9FD]/[0.6] text-lg">
          {stepsContent[step].description}
        </p>
      </div>
      <img
        src={stepsContent[step].image}
        alt={`${stepsContent[step].title}_image`}
      />
    </li>
  );
};

const Stepper: FC<{ step: number }> = ({ step }) => {
  return (
    <div className="md:mb-12 mb-6 flex gap-3">
      <StepLine active />
      <StepLine active={step > 0} />
      <StepLine active={step > 1} />
    </div>
  );
};

const StepLine: FC<{ active: boolean }> = ({ active }) => (
  <span
    className={classNames(
      "w-16 h-1 bg-[#D9D9D9]/[.3] rounded-full",
      "relative after:absolute after:h-full after:rounded-full after:bg-[#80EF6E]",
      "after:transition-all after:duration-200",
      active ? "after:w-full" : "after:w-0",
    )}
  />
);
