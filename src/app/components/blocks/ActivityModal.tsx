import { memo, useCallback } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import { activityModalAtom } from "app/atoms";
import { OverflowProvider } from "app/hooks";
import Button from "app/components/elements/Button";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";

const ActivityModal = memo(() => {
  const [activityOpened, setActivityOpened] = useAtom(activityModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setActivityOpened([open, "replace"]);
    },
    [setActivityOpened]
  );

  const isMounted = useIsMounted();
  const bootAnimationDisplayed = activityOpened && isMounted();

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
            "w-full max-w-6xl min-w-[40rem]",
            "max-h-[41rem]",
            "m-auto inset-x-0 inset-y-[3.5rem]",
            "rounded-[2.5rem]",
            bootAnimationDisplayed && "animate-modalcontent"
          )}
        >
          <OverflowProvider>
            {(ref) => (
              <ScrollAreaContainer
                ref={ref}
                className={classNames(
                  "w-full h-full",
                  "rounded-[2.5rem]",
                  "border border-brand-light/5",
                  [
                    "brandbg-large-modal",
                    "after:absolute after:inset-0",
                    "after:shadow-addaccountmodal",
                    "after:rounded-[2.5rem]",
                    "after:pointer-events-none",
                    "after:z-20",
                  ]
                )}
                scrollBarClassName={classNames(
                  "pt-[4.25rem]",
                  "!right-1",
                  "pb-28"
                )}
                type="scroll"
              >
                <Dialog.Close className="absolute top-4 right-4" asChild>
                  <Button theme="clean">Cancel</Button>
                </Dialog.Close>

                <ActivityContent />
              </ScrollAreaContainer>
            )}
          </OverflowProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default ActivityModal;

const ActivityContent = memo(() => {
  return (
    <div className="w-[59rem] mx-auto h-full pt-16 flex flex-col">
      <SectionHeader>Activity</SectionHeader>
    </div>
  );
});

const SectionHeader = memo(({ children }) => (
  <div className={classNames("w-full")}>
    <h1 className={"text-2xl font-bold"}>{children}</h1>
  </div>
));
