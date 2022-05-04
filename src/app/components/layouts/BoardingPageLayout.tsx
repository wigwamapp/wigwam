import { FC } from "react";
import classNames from "clsx";
import { getPublicURL } from "lib/ext/utils";

import ContentContainer from "app/components/layouts/ContentContainer";
import Button from "app/components/elements/Button";
import BackButton from "app/components/elements/BackButton";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";
import { ReactComponent as ArrowLeftLongIcon } from "app/icons/arrow-left-long.svg";

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
      "min-h-screen flex flex-col"
    )}
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
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50%] flex items-center justify-center">
        <img
          src={getPublicURL("icons/test-welcome-bg.png")}
          className="w-auto h-full"
          alt=""
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#0D0E1D]/80 to-[#0D0E1D]/0" />
      </div>
    )}
  </div>
);

export default BoardingPageLayout;
