import React from "react";
import classNames from "clsx";
import ContentContainer from "app/components/layout/ContentContainer";

const PageLayout: React.FC = ({ children }) => {
  const [bootAnimationDisplayed, setBootAnimationDisplayed] = React.useState(
    true
  );

  const handleAnimationEnd = React.useCallback(() => {
    setBootAnimationDisplayed(false);
  }, [setBootAnimationDisplayed]);

  return (
    <div
      className={classNames(
        bootAnimationDisplayed && "animate-bootfadein",
        "min-h-screen flex flex-col"
      )}
      onAnimationEnd={bootAnimationDisplayed ? handleAnimationEnd : undefined}
    >
      <ContentContainer>
        <header className="flex items-center py-8">Header</header>

        <main>{children}</main>
      </ContentContainer>
    </div>
  );
};

export default PageLayout;
