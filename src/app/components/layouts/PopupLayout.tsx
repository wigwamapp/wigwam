import { FC, Suspense, useEffect, useRef, useState } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { IS_FIREFOX } from "app/defaults";
import { openInTab } from "app/helpers";
import { updateAvailableAtom, walletStatusAtom } from "app/atoms";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import ActivityBar from "app/components/blocks/ActivityBar";
import RoundedButton from "app/components/elements/RoundedButton";
import LockProfileButton from "app/components/elements/LockProfileButton";
import { ReactComponent as FullScreenIcon } from "app/icons/full-screen.svg";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down.svg";
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
  const [isScrollTopShown, setIsScrollTopShown] = useState(false);

  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current;
    if (scrollAreaElement) {
      scrollAreaElement.addEventListener("scroll", () => {
        setIsScrollTopShown(scrollAreaElement.scrollTop >= 120);
      });

      return () => scrollAreaElement.removeEventListener("scroll", () => null);
    }
    return;
  }, []);

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
            className="mt-2 h-full min-h-0"
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

            {isScrollTopShown && (
              <button
                type="button"
                onClick={() =>
                  scrollAreaRef.current?.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className={classNames(
                  "w-8 h-8",
                  "rounded-lg",
                  "bg-brand-darkblue/20",
                  "backdrop-blur-[10px]",
                  IS_FIREFOX && "!bg-[#0D1020]/[.95]",
                  "border border-brand-main/[.05]",
                  "shadow-addaccountmodal",
                  "fixed bottom-14 right-3",
                  "flex items-center justify-center"
                )}
              >
                <ChevronDownIcon
                  className={classNames(
                    "w-6 min-w-[1.5rem]",
                    "h-auto",
                    "-mt-0.5",
                    "rotate-180"
                  )}
                />
              </button>
            )}

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
