import {
  FC,
  ReactNode,
  ButtonHTMLAttributes,
  MouseEventHandler,
  memo,
  useCallback,
} from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { goBack, getPosition } from "lib/history";
import ArrowNarrowLeftIcon from "@heroicons/react/solid/ArrowNarrowLeftIcon";
import { T } from "lib/ext/i18n/react";

import { pageAtom } from "app/atoms";
import { Page } from "app/defaults";
import ContentContainer from "app/components/layouts/ContentContainer";
import ProfileNav from "app/components/blocks/ProfileNav";
import Heading from "app/components/elements/Heading";

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

type BackButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = memo<BackButtonProps>(({ className, onClick, ...rest }) => {
  const [page, setPage] = useAtom(pageAtom);
  const historyPosition = getPosition();

  const inHome = page === Page.Default;
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
          setPage([Page.Default, "replace"]);
          break;
      }
    },
    [onClick, historyPosition, inHome, setPage]
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
      <T i18nKey="back" />
    </button>
  ) : null;
});
