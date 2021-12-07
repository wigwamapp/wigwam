import { FC } from "react";
import classNames from "clsx";
import ContentContainer from "app/components/layouts/ContentContainer";
import Sidebar from "../blocks/Sidebar";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const PageLayout: FC<{ animate?: boolean }> = ({
  children,
  animate = true,
}) => (
  <div
    className={classNames(
      // (bootAnimationDisplayed || animate) && "animate-bootfadein",
      "min-h-screen flex flex-col"
    )}
    onAnimationEnd={
      bootAnimationDisplayed || animate ? handleBootAnimationEnd : undefined
    }
  >
    <ContentContainer className="flex flex-grow">
      <Sidebar />

      <main className="py-4 pl-6 flex-grow">{children}</main>
    </ContentContainer>
  </div>
);

export default PageLayout;
