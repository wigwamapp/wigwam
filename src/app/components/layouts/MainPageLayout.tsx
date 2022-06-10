import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import Sidebar from "app/components/blocks/Sidebar";
import Menu from "app/components/blocks/Menu";
import ActivityBar from "app/components/blocks/ActivityBar";

import PreloadBaseAndSync from "./PreloadBaseAndSync";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const MainPageLayout: FC = ({ children }) => (
  <PreloadBaseAndSync>
    <div
      className={classNames(
        "h-screen flex flex-col",
        bootAnimationDisplayed && "animate-bootfadein"
      )}
      onAnimationEnd={
        bootAnimationDisplayed ? handleBootAnimationEnd : undefined
      }
    >
      <ContentContainer className="flex grow max-h-screen">
        <Sidebar />

        <main
          className={classNames("w-full min-w-0 pl-6", "grow", "flex flex-col")}
        >
          <Menu />

          {children}
        </main>
      </ContentContainer>
      <ActivityBar />
    </div>
  </PreloadBaseAndSync>
);

export default MainPageLayout;
