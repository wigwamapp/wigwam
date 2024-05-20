import {
  FC,
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import { onRampModalAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";
import IconedButton from "app/components/elements/IconedButton";

const OnRampIframe = lazy(() => import("./OnRampIframe"));

const AddFundsOnRampModal = memo(() => {
  const [onRampModalOpened, setOnRampModalOpened] = useAtom(onRampModalAtom);
  const { confirm } = useDialog();
  const isMounted = useIsMounted();
  const contentRenderedRef = useRef(false);

  const bootAnimationDisplayed = useMemo(
    () => onRampModalOpened && isMounted() && !contentRenderedRef.current,
    [isMounted, onRampModalOpened],
  );

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      const res = await confirm({
        title: "Cancel funding operation",
        content: (
          <p className="mb-4 mx-auto text-center">
            Are you sure you want to cancel? If you close the window now, all
            data from previous steps will be lost.
          </p>
        ),
        noButtonText: "Stay",
        yesButtonText: "Cancel",
        buttonTheme: {
          primary: "secondary",
          secondary: "primary",
        },
      });

      if (!res) {
        return;
      }
      setOnRampModalOpened([open]);
    },
    [confirm, setOnRampModalOpened],
  );

  const handleContentMount = useCallback((mounted: boolean) => {
    contentRenderedRef.current = mounted;
  }, []);

  return (
    <Dialog.Root open={onRampModalOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames("fixed inset-0 z-20", "bg-brand-darkblue/50")}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={classNames(
            "fixed z-20 top-0 left-0 right-0 bottom-0",
            "bg-brand-darkblue/90",
            "m-auto inset-x-0 inset-y-[3.5rem]",
            "brandbg-large-modal",
            bootAnimationDisplayed && "animate-modalcontent",
          )}
        >
          <OnMount handle={handleContentMount} />

          {onRampModalOpened && (
            <div className="flex justify-center h-full py-16">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="atom-spinner w-16 h-16" />
                  </div>
                }
              >
                <OnRampIframe />

                <Dialog.Close
                  className="-mr-12"
                  asChild
                  aria-description="Close"
                >
                  <IconedButton
                    aria-label="Close"
                    Icon={CloseIcon}
                    className="h-6 w-6"
                  />
                </Dialog.Close>
              </Suspense>
            </div>
          )}

          <div
            className={classNames(
              "absolute inset-0",
              "shadow-addaccountmodal",
              "pointer-events-none",
              "z-20",
            )}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default AddFundsOnRampModal;

const OnMount: FC<{ handle: (mounted: boolean) => void }> = ({ handle }) => {
  useEffect(() => {
    handle(true);
    return () => handle(false);
  }, [handle]);

  return null;
};
