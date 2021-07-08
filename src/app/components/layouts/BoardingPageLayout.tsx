import {
  FC,
  ReactNode,
  ButtonHTMLAttributes,
  MouseEventHandler,
  memo,
  useCallback,
} from "react";
import classNames from "clsx";
import { HistoryAction, useLocation, goBack, navigate } from "woozie";
import ArrowNarrowLeftIcon from "@heroicons/react/solid/ArrowNarrowLeftIcon";

import ContentContainer from "app/components/layouts/ContentContainer";
import Heading from "app/components/elements/Heading";

type BoardingPageLayoutProps = {
  title: ReactNode;
  animate?: boolean;
};

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

const BoardingPageLayout: FC<BoardingPageLayoutProps> = ({
  title,
  animate = true,
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
    <ContentContainer>
      <header className="mt-16 mb-8">
        <div>
          <BackButton className="mb-8" />
          <Heading className="mt-16">{title}</Heading>
        </div>
      </header>

      <main>{children}</main>
    </ContentContainer>
  </div>
);

export default BoardingPageLayout;

type BackButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = memo<BackButtonProps>(({ className, onClick, ...rest }) => {
  const { historyPosition, pathname } = useLocation();

  const inHome = pathname === "/";
  const canBack = historyPosition > 0 || !inHome;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      if (onClick) {
        onClick(evt);
        if (evt.defaultPrevented) {
          return;
        }
      }

      switch (true) {
        case historyPosition > 0:
          goBack();
          break;

        case !inHome:
          navigate("/", HistoryAction.Replace);
          break;
      }
    },
    [onClick, historyPosition, inHome]
  );

  return canBack ? (
    <button
      className={classNames(
        "inline-flex items-center justify-center",
        "text-xl text-white",
        className
      )}
      onClick={handleClick}
      {...rest}
    >
      <ArrowNarrowLeftIcon className="mr-2 h-6 w-auto stroke-current stroke-1" />
      Back
    </button>
  ) : null;
});
