import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import Button from "app/components/elements/Button";
import BackButton from "app/components/elements/BackButton";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";
import { ReactComponent as ArrowLeftLongIcon } from "app/icons/arrow-left-long.svg";
import WelcomeBgImage from "app/images/welcome-bg.jpg";

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
              className="absolute bottom-2 left-0 group"
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
            <BackButton className="absolute bottom-2 left-0" />
          )}
        </header>
      )}

      <div className="mb-24">{children}</div>
    </ContentContainer>
    {!isWelcome && (
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
    )}
  </div>
);

export default BoardingPageLayout;
