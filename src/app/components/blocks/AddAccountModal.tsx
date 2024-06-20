import {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  MouseEventHandler,
} from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom, useAtomValue } from "jotai";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import { WalletStatus } from "core/types";

import { IS_FIREFOX } from "app/defaults";
import { AddAccountStep } from "app/nav";
import {
  addAccountModalAtom,
  addAccountStepAtom,
  walletStateAtom,
} from "app/atoms";
import { OverflowProvider } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import Button from "app/components/elements/Button";
import BackButton from "app/components/elements/BackButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import AddAccountSteps from "app/components/blocks/AddAccountSteps";
import { ReactComponent as WigwamIcon } from "app/icons/Wigwam.svg";

const AddAccountModal = memo(() => {
  const [accModalOpened, setAccModalOpened] = useAtom(addAccountModalAtom);
  const accountStep = useAtomValue(addAccountStepAtom);
  const { walletStatus } = useAtomValue(walletStateAtom);

  const { confirm } = useDialog();
  const isInitial = walletStatus === WalletStatus.Welcome;

  const handleBackButton = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (e) => {
      if (
        [
          AddAccountStep.CreateSeedPhrase,
          AddAccountStep.VerifySeedPhrase,
        ].includes(accountStep)
      ) {
        const res = await confirm({
          title: "Secret phrase creation",
          content: (
            <p className="mb-4 mx-auto text-center">
              Are you sure you want to cancel wallet creation? If you go to the
              previous step, secret phrase will be regenerated.
            </p>
          ),
          noButtonText: "Stay",
          yesButtonText: "Back",
        });

        if (!res) {
          e.preventDefault();
        }
      }
    },
    [accountStep, confirm],
  );

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (
        [
          AddAccountStep.CreateSeedPhrase,
          AddAccountStep.VerifySeedPhrase,
          AddAccountStep.ImportSeedPhrase,
          AddAccountStep.ConfirmAccounts,
          AddAccountStep.SetupPassword,
        ].includes(accountStep)
      ) {
        const res = await confirm({
          title: "Cancel wallet creation",
          content: (
            <p className="mb-4 mx-auto text-center">
              Are you sure you want to cancel wallet creation? If you close the
              window now, all data from previous steps will be lost.
            </p>
          ),
          noButtonText: "Stay",
          yesButtonText: "Cancel",
        });

        if (!res) {
          return;
        }
      }
      setAccModalOpened([open, "replace"]);
    },
    [accountStep, confirm, setAccModalOpened],
  );

  const isMounted = useIsMounted();
  const contentRenderedRef = useRef(false);
  const handleContentMount = useCallback((mounted: boolean) => {
    contentRenderedRef.current = mounted;
  }, []);

  const bootAnimationDisplayed =
    !isInitial && accModalOpened && isMounted() && !contentRenderedRef.current;

  useEffect(() => {
    if (!accModalOpened) return;

    const t = setTimeout(() => {
      const scrollarea = document.querySelector(
        ".add-account-scrollviewport",
      ) as HTMLElement;

      if (scrollarea) {
        scrollarea.scrollLeft = scrollarea.offsetWidth / 2;
      }
    }, 0);

    return () => clearTimeout(t);
  }, [accModalOpened]);

  return (
    <Dialog.Root open={accModalOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames("fixed inset-0 z-20", "bg-brand-darkblue/50")}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={classNames(
            "fixed z-20",
            "w-full max-w-6xl md:min-w-[40rem]",
            "max-h-[41rem]",
            "m-auto inset-x-0 inset-y-[3.5rem]",
            "rounded-[2.5rem]",
            bootAnimationDisplayed && "animate-modalcontent",
          )}
        >
          <OnMount handle={handleContentMount} />

          <WigwamIcon
            className={classNames(
              "w-16 h-auto",
              "absolute",
              "top-0 left-1/2",
              "-translate-x-1/2 -translate-y-1/4",
              "z-30",
            )}
          />

          <OverflowProvider>
            {(ref) => (
              <ScrollAreaContainer
                ref={ref}
                className={classNames(
                  "w-full h-full",
                  "rounded-[2.5rem]",
                  "border border-brand-light/5",
                  !isInitial && [
                    "brandbg-large-modal",
                    "after:absolute after:inset-0",
                    "after:shadow-addaccountmodal",
                    "after:rounded-[2.5rem]",
                    "after:pointer-events-none",
                    "after:z-20",
                  ],
                )}
                viewPortClassName="add-account-scrollviewport"
                scrollBarClassName={classNames(
                  "pt-[4.25rem]",
                  "!right-1",
                  "pb-28", // "[3.25rem]"
                )}
                type="scroll"
              >
                {isInitial && (
                  <div
                    className={classNames(
                      "absolute inset-0 z-[-5] rounded-[2.5rem] overflow-hidden",
                      "bg-brand-dark/10 backdrop-blur-[30px]",
                      IS_FIREFOX && "brandbg-large-modal",
                    )}
                  />
                )}

                <BackButton
                  navAtom={addAccountStepAtom}
                  initialValue={AddAccountStep.AddAccountInitial}
                  onClick={handleBackButton}
                  className="absolute top-6 left-8 mmd:top-4 mmd:left-4"
                />

                <Dialog.Close
                  className="absolute top-6 right-8 mmd:top-4 mmd:right-4"
                  asChild
                >
                  <Button theme="clean">Cancel</Button>
                </Dialog.Close>

                {accModalOpened && <AddAccountSteps />}

                {isInitial && (
                  <div
                    className={classNames(
                      "absolute inset-0",
                      "shadow-addaccountmodal",
                      "rounded-[2.5rem]",
                      "pointer-events-none",
                      "z-20",
                    )}
                  />
                )}
              </ScrollAreaContainer>
            )}
          </OverflowProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default AddAccountModal;

const OnMount: FC<{ handle: (mounted: boolean) => void }> = ({ handle }) => {
  useEffect(() => {
    handle(true);
    return () => handle(false);
  }, [handle]);

  return null;
};
