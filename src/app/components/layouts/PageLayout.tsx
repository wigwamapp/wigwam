import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import Sidebar from "app/components/blocks/Sidebar";
import Menu from "app/components/blocks/Menu";

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
    <ContentContainer className="flex grow">
      <Sidebar />

      <main className="pl-6 grow w-full min-w-0">
        <Menu />
        {children}
      </main>
    </ContentContainer>
  </div>
);

export default PageLayout;
