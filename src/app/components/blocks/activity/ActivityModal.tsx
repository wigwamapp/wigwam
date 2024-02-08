import { memo, Suspense, useCallback } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";

import { useIsMounted } from "lib/react-hooks/useIsMounted";
import { isPopup } from "lib/ext/view";

import { activityModalAtom } from "app/atoms";
import { OverflowProvider } from "app/hooks";
import { ReactComponent as ActivityIcon } from "app/icons/ActivityIcon.svg";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";

import Button from "../../elements/Button";
import ScrollAreaContainer from "../../elements/ScrollAreaContainer";
import IconedButton from "../../elements/IconedButton";

import ActivityContent from "./ActivityContent";

const ActivityModal = memo(() => {
  const [activityOpened, setActivityOpened] = useAtom(activityModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setActivityOpened([open, "replace"]);
    },
    [setActivityOpened],
  );

  const isMounted = useIsMounted();
  const bootAnimationDisplayed = activityOpened && isMounted();

  const isPopupMode = isPopup();

  return (
    <Dialog.Root open={activityOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames("fixed inset-0 z-20", "bg-brand-darkblue/50")}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={classNames(
            "fixed z-20",
            "w-full",
            !isPopupMode && "max-h-[41rem] min-w-[40rem] max-w-4xl",
            "m-auto inset-x-0",
            isPopupMode ? "inset-y-0" : "inset-y-[3.5rem]",
            !isPopupMode && "rounded-[2.5rem]",
            bootAnimationDisplayed && "animate-modalcontent",
          )}
        >
          {!isPopupMode && (
            <ActivityIcon
              className={classNames(
                "w-[3rem] h-[3rem]",
                "styled-icon",
                "styled-icon--active",
                "absolute",
                "top-0 left-1/2",
                "-translate-x-1/2 -translate-y-1/2",
                "z-30",
              )}
            />
          )}
          <OverflowProvider>
            {(ref) => (
              <ScrollAreaContainer
                ref={ref}
                className={classNames(
                  "w-full h-full",
                  !isPopupMode && "rounded-[2.5rem]",
                  "border border-brand-light/5",
                  "brandbg-large-modal",
                  !isPopupMode && [
                    "after:absolute after:inset-0",
                    "after:shadow-addaccountmodal",
                    "after:rounded-[2.5rem]",
                    "after:pointer-events-none",
                    "after:z-20",
                  ],
                )}
                viewPortClassName="viewportBlock"
                horizontalScrollBarClassName={classNames(
                  isPopupMode ? "" : "px-[2.25rem]",
                )}
                verticalScrollBarClassName={classNames(
                  isPopupMode ? "" : "pt-[4.25rem] pb-[3.25rem]",
                  isPopupMode ? "!right-0" : "!right-1",
                )}
                hiddenScrollbar={isPopupMode ? "horizontal" : undefined}
                type="scroll"
              >
                <Dialog.Close
                  className={classNames(
                    isPopupMode ? "top-7" : "top-4",
                    "absolute right-4",
                  )}
                  asChild
                >
                  {isPopupMode ? (
                    <IconedButton Icon={CloseIcon} theme="tertiary" />
                  ) : (
                    <Button theme="clean">Close</Button>
                  )}
                </Dialog.Close>

                <Suspense fallback={null}>
                  {activityOpened && <ActivityContent />}
                </Suspense>
              </ScrollAreaContainer>
            )}
          </OverflowProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default ActivityModal;
