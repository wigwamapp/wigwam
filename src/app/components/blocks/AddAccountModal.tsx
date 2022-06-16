import { memo, useCallback } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import { WalletStatus } from "core/types";

import { AddAccountStep } from "app/nav";
import {
  addAccountModalAtom,
  addAccountStepAtom,
  walletStatusAtom,
} from "app/atoms";
import { OverflowProvider } from "app/hooks";
import Button from "app/components/elements/Button";
import BackButton from "app/components/elements/BackButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import AddAccountSteps from "app/components/blocks/AddAccountSteps";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

const AddAccountModal = memo(() => {
  const [accModalOpened, setAccModalOpened] = useAtom(addAccountModalAtom);
  const accountStep = useAtomValue(addAccountStepAtom);
  const walletStatus = useAtomValue(walletStatusAtom);
  const isInitial = walletStatus === WalletStatus.Welcome;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setAccModalOpened([open, "replace"]);
    },
    [setAccModalOpened]
  );

  const isMounted = useIsMounted();
  const bootAnimationDisplayed = !isInitial && accModalOpened && isMounted();

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
            "w-full max-w-6xl min-w-[40rem]",
            "max-h-[41rem]",
            "m-auto inset-x-0 inset-y-[3.5rem]",
            "rounded-[2.5rem]",
            bootAnimationDisplayed && "animate-modalcontent"
          )}
        >
          <div
            className={classNames(
              "flex items-center justify-center",
              "w-[6.5rem] h-[6.5rem]",
              "rounded-full",
              // "bg-brand-dark/20",
              // "backdrop-blur-[10px]",
              "!bg-[#0D1020]", // TODO: add firefox:
              "border border-brand-light/5",
              "shadow-addaccountmodal",
              "absolute",
              "top-0 left-1/2",
              "-translate-x-1/2 -translate-y-1/2",
              "z-30"
            )}
          >
            <VigvamIcon className="w-16 mt-2" />
          </div>

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
                  ]
                )}
                scrollBarClassName={classNames(
                  "pt-[4.25rem]",
                  "!right-1",
                  accountStep === AddAccountStep.ChooseWay
                    ? "pb-[3.25rem]"
                    : "pb-28"
                )}
                type="scroll"
              >
                {isInitial && (
                  <div
                    className={classNames(
                      "absolute inset-0 z-[-5] rounded-[2.5rem] overflow-hidden",
                      // "bg-brand-dark/10 backdrop-blur-[30px]",
                      "brandbg-large-modal" // TODO: add firefox:
                    )}
                  />
                )}

                <BackButton
                  navAtom={addAccountStepAtom}
                  initialValue={AddAccountStep.ChooseWay}
                  className="absolute top-4 left-4"
                />

                <Dialog.Close className="absolute top-4 right-4" asChild>
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
                      "z-20"
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
