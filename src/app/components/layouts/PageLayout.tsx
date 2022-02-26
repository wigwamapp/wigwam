import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import Sidebar from "app/components/blocks/Sidebar";
import Menu from "app/components/blocks/Menu";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const PageLayout: FC<{ animate?: boolean; className?: string }> = ({
  children,
  animate = true,
  className,
}) => (
  <div
    className={classNames(
      // (bootAnimationDisplayed || animate) && "animate-bootfadein",
      "h-screen flex flex-col"
    )}
    onAnimationEnd={
      bootAnimationDisplayed || animate ? handleBootAnimationEnd : undefined
    }
  >
    <ContentContainer className="flex grow max-h-screen">
      <Sidebar />

      <main
        className={classNames(
          "w-full min-w-0 pl-6",
          "grow overflow-hidden",
          className
        )}
      >
        <Menu />
        {children}
      </main>
    </ContentContainer>
  </div>
);

export default PageLayout;
