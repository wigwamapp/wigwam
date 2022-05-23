import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import Button from "app/components/elements/Button";
import BackButton from "app/components/elements/BackButton";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";
import { ReactComponent as ArrowLeftLongIcon } from "app/icons/arrow-left-long.svg";
import WelcomeBgImage from "app/images/welcome-bg.jpg";
import WelcomeTreeLeftImage from "app/images/welcome-tree-left.png";
import WelcomeTreeRightImage from "app/images/welcome-tree-right.png";
import WelcomeWigwamImage from "app/images/welcome-wigwam.png";
import WelcomeFireImage from "app/images/welcome-fire.png";

type BoardingPageLayoutProps = {
  header?: boolean;
  animate?: boolean;
  isWelcome?: boolean;
};

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const BoardingPageLayout: FC<BoardingPageLayoutProps> = ({
  header = true,
  animate = false,
  isWelcome = false,
  children,
}) => (
  <div
    className={classNames(
      (bootAnimationDisplayed || animate) && "animate-bootfadein",
      "relative",
      "min-h-screen flex flex-col",
      "bg-center bg-cover"
    )}
    style={{
      backgroundImage: isWelcome ? `url('${WelcomeBgImage}')` : "none",
    }}
    onAnimationEnd={
      bootAnimationDisplayed || animate ? handleBootAnimationEnd : undefined
    }
  >
    <ContentContainer narrow className="relative pt-[14vh]">
      {header && (
        <header className="flex items-stretch relative">
          {isWelcome ? (
            <Button
              theme="clean"
              to={{ page: "profiles" }}
              className="absolute bottom-2 left-0 group !font-bold"
            >
              <ArrowLeftLongIcon
                className={classNames(
                  "mr-2",
                  "transition-transform",
                  "group-hover:-translate-x-1.5 group-focus:-translate-x-1.5"
                )}
              />
              Profiles
            </Button>
          ) : (
            <BackButton className="absolute bottom-2 left-0 !font-bold" />
          )}
        </header>
      )}

      <div className="mb-24">{children}</div>
    </ContentContainer>
    {!isWelcome ? (
      <div
        className={classNames(
          "mt-auto mb-6",
          "text-2xl",
          "font-black",
          "w-full flex justify-center items-center"
        )}
      >
        <VigvamIcon className={classNames("h-[2rem]", "w-auto mr-3")} />
        Vigvam
      </div>
    ) : (
      <>
        <img
          src={WelcomeTreeLeftImage}
          alt="Vigvam"
          className={classNames("absolute bottom-0 left-0", "h-[83.5%] w-auto")}
        />
        <img
          src={WelcomeTreeRightImage}
          alt="Vigvam"
          className={classNames(
            "absolute bottom-0 right-0",
            "h-[82.6%] w-auto"
          )}
        />
        <img
          src={WelcomeWigwamImage}
          alt="Vigvam"
          className={classNames(
            "absolute bottom-[7.5%] right-[22.7%]",
            "h-[42.1%] w-auto"
          )}
        />
        <img
          src={WelcomeFireImage}
          alt="Vigvam"
          className={classNames(
            "absolute bottom-[8.5%] right-[42%]",
            "h-[50.8%] w-auto"
          )}
        />
      </>
    )}
  </div>
);

export default BoardingPageLayout;
