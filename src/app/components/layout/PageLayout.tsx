import { useState, useCallback } from "react";
import classNames from "clsx";
import ContentContainer from "app/components/layout/ContentContainer";

const PageLayout: React.FC = ({ children }) => {
  const [bootAnimationDisplayed, setBootAnimationDisplayed] = useState(true);

  const handleAnimationEnd = useCallback(() => {
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
        <header className="flex items-center py-8">
          <h1 className="font-semibold text-xl">Header</h1>
        </header>

        <main>{children}</main>
      </ContentContainer>
    </div>
  );
};

export default PageLayout;
