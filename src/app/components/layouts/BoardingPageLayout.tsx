import { FC, ReactNode } from "react";
import classNames from "clsx";

import ContentContainer from "app/components/layouts/ContentContainer";
import ProfileNav from "app/components/blocks/ProfileNav";
import Heading from "app/components/elements/Heading";
import BackButton from "app/components/elements/BackButton";

type BoardingPageLayoutProps = {
  title?: ReactNode;
  header?: boolean;
  profileNav?: boolean;
  animate?: boolean;
};

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const BoardingPageLayout: FC<BoardingPageLayoutProps> = ({
  title,
  header = true,
  profileNav = true,
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
    <ContentContainer narrow>
      {header && (
        <header className="mt-16 mb-8 flex items-stretch">
          <BackButton />
          <div className="flex-1" />
          {title && (
            <>
              <Heading className="mt-16">{title}</Heading>
              <div className="flex-1" />
            </>
          )}
          {profileNav && <ProfileNav />}
        </header>
      )}

      {children}
    </ContentContainer>
  </div>
);

export default BoardingPageLayout;
