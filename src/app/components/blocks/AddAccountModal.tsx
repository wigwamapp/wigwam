import { memo, useCallback } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";

import { AddAccountStep } from "app/defaults";
import { addAccountModalAtom, addAccountStepAtom } from "app/atoms";

import NewButton from "app/components/elements/NewButton";
import BackButton from "app/components/elements/BackButton";
import AddAccountSteps from "app/components/blocks/AddAccountSteps";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

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
            "h-3/4 w-full max-w-6xl min-w-[40rem]",
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
            <BackButton className="fixed top-4 left-4 " />
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
