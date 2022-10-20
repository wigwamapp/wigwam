import { FC, Suspense, useRef } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { openInTab } from "app/helpers";
import { updateAvailableAtom, walletStatusAtom } from "app/atoms";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import ActivityBar from "app/components/blocks/ActivityBar";
import RoundedButton from "app/components/elements/RoundedButton";
import LockProfileButton from "app/components/elements/LockProfileButton";
import { ScrollTopButton } from "app/components/elements/ScrollTopButton";
import { ReactComponent as FullScreenIcon } from "app/icons/full-screen.svg";
import { OverflowProvider } from "app/hooks";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

type PopupLayoutProps = {
  className?: string;
};

const PopupLayout: FC<PopupLayoutProps> = ({ className, children }) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const walletStatus = useAtomValue(walletStatusAtom);
  const updateAvailable = useAtomValue(updateAvailableAtom);

  const isUnlocked = walletStatus === WalletStatus.Unlocked;

  return (
    <OverflowProvider>
      {(ref) => (
        <div
          ref={ref}
          className={classNames(
            "w-full",
            "flex flex-col items-stretch",
            "h-screen",
            bootAnimationDisplayed && "animate-bootfadeinfast"
          )}
          onAnimationEnd={
            bootAnimationDisplayed ? handleBootAnimationEnd : undefined
          }
        >
          <ScrollAreaContainer
            ref={scrollAreaRef}
            hiddenScrollbar="horizontal"
            className="h-full min-h-0"
            viewPortClassName="viewportBlock"
            scrollBarClassName="pt-[15.375rem] pb-16 pl-0.5 pr-0.5 w-3"
          >
            <div className="flex px-3 pt-3">
              {isUnlocked && <LockProfileButton className="mr-2" />}

              <RoundedButton
                theme={isUnlocked ? "small" : "large"}
                onClick={() => openInTab(undefined, ["token"])}
                className={classNames(
                  "w-full",
                  !isUnlocked && "p-3.5",
                  isUnlocked && "p-3"
                )}
              >
                <FullScreenIcon className="mr-1" />
                Open Full
                {updateAvailable ? (
                  <div
                    className={classNames(
                      "w-2 h-2",
                      "bg-activity rounded-full",
                      "absolute top-2 right-2"
                    )}
                  />
                ) : null}
              </RoundedButton>
            </div>

            <main
              className={classNames(
                "relative",
                "flex-1",
                "pt-3 pb-16 px-3",
                "overflow-hidden",
                "flex flex-col",
                className
              )}
            >
              {children}
            </main>

            <ScrollTopButton
              scrollAreaRef={scrollAreaRef}
              className="fixed bottom-14 right-3"
            />

            <Suspense fallback={null}>
              {isUnlocked && <ActivityBar theme="small" />}
            </Suspense>
          </ScrollAreaContainer>
        </div>
      )}
    </OverflowProvider>
  );
};

export default PopupLayout;
