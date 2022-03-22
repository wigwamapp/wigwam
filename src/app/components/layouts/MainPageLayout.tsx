import { FC } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import Sidebar from "app/components/blocks/Sidebar";
import Menu from "app/components/blocks/Menu";
import ActivityBar from "app/components/blocks/ActivityBar";

import PreloadUnlocked from "./PreloadUnlocked";

const MainPageLayout: FC = ({ children }) => (
  <PreloadUnlocked>
    <div className="h-screen flex flex-col">
      <ContentContainer className="flex grow max-h-screen">
        <Sidebar />

        <main
          className={classNames(
            "w-full min-w-0 pl-6",
            "grow overflow-hidden",
            "flex flex-col"
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

export default MainPageLayout;