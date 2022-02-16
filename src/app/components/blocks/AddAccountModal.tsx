import { memo, useCallback } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { goBack } from "lib/history";

import { AddAccountStep } from "app/defaults";
import { addAccountModalAtom, addAccountStepAtom } from "app/atoms";

import NewButton from "app/components/elements/NewButton";
import AddAccountSteps from "app/components/blocks/AddAccountSteps";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";
import { ReactComponent as ArrowLeftLongIcon } from "app/icons/arrow-left-long.svg";

const AddAccountModal = memo(() => {
  const [accModalOpened, setAccModalOpened] = useAtom(addAccountModalAtom);
  const accountStep = useAtomValue(addAccountStepAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setAccModalOpened([open, "replace"]);
    },
    [setAccModalOpened]
  );

  return (
    <Dialog.Root open={accModalOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <div
          className={classNames(
            "flex items-center justify-center",
            "w-[6.5rem] h-[6.5rem]",
            "rounded-full",
            "bg-brand-dark/10",
            "backdrop-blur-[30px]",
            "border border-brand-light/5",
            "shadow-addaccountmodal",
            "absolute",
            "top-[12.5%] left-1/2",
            "-translate-x-1/2 -translate-y-1/2",
            "z-30"
          )}
        >
          <VigvamIcon className="w-16 mt-2" />
        </div>
        <Dialog.Content
          className={classNames(
            "fixed z-20",
            "h-3/4 w-4/5 min-w-[40rem]",
            "m-auto inset-x-0 inset-y-0",
            "bg-brand-dark/10",
            "backdrop-blur-[30px]",
            "border border-brand-light/5",
            "rounded-[2.5rem]",
            "overflow-hidden",
            "after:absolute after:inset-0",
            "after:shadow-addaccountmodal",
            "after:rounded-[2.5rem]",
            "after:pointer-events-none",
            "after:z-30"
          )}
        >
          {accountStep !== AddAccountStep.ChooseWay && (
            <NewButton
              theme="clean"
              onClick={goBack}
              className="fixed top-4 left-4 group"
            >
              <ArrowLeftLongIcon
                className={classNames(
                  "mr-2",
                  "transition-transform",
                  "group-hover:-translate-x-1.5 group-focus:-translate-x-1.5"
                )}
              />
              Back
            </NewButton>
          )}
          <Dialog.Close className="fixed top-4 right-4" asChild>
            <NewButton theme="clean">Cancel</NewButton>
          </Dialog.Close>

          <div className="overflow-y-scroll h-full">
            {accModalOpened && <AddAccountSteps />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default AddAccountModal;
