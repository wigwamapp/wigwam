import { FC } from "react";
import classNames from "clsx";
import ContentContainer from "app/components/layouts/ContentContainer";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const PageLayout: FC = ({ children }) => (
  <div
    className={classNames(
      bootAnimationDisplayed && "animate-bootfadein",
      "min-h-screen flex flex-col"
    )}
    onAnimationEnd={bootAnimationDisplayed ? handleBootAnimationEnd : undefined}
  >
    <ContentContainer>{children}</ContentContainer>
  </div>
);

export default PageLayout;
