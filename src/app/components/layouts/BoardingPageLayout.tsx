import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import BackButton from "app/components/elements/BackButton";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

type BoardingPageLayoutProps = {
  header?: boolean;
  animate?: boolean;
};

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const BoardingPageLayout: FC<BoardingPageLayoutProps> = ({
  header = true,
  animate = false,
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
    <ContentContainer narrow className="mt-[14vh]">
      {header && (
        <header className="flex items-stretch relative">
          <BackButton className="absolute bottom-2 left-0" />
        </header>
      )}

      <div className="mb-24">{children}</div>
    </ContentContainer>
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
  </div>
);

export default BoardingPageLayout;
