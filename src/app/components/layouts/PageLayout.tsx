import { FC } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";

import { chainIdAtom, currentAccountAtom } from "app/atoms";
import ContentContainer from "app/components/layouts/ContentContainer";
import Sidebar from "app/components/blocks/Sidebar";
import Menu from "app/components/blocks/Menu";
import ActivityBar from "app/components/blocks/ActivityBar";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const PageLayout: FC<{ animate?: boolean; className?: string }> = ({
  children,
  animate = true,
  className,
}) => (
  <PreloadUnlocked>
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
      <ActivityBar />
    </div>
  </PreloadUnlocked>
);

export default PageLayout;

const PreloadUnlocked: FC = ({ children }) => {
  useAtomValue(waitForAll([currentAccountAtom, chainIdAtom]));

  return <>{children}</>;
};
