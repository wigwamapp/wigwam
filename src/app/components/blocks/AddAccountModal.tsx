import { memo, useCallback } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";

import { addAccountModalAtom } from "app/atoms";

import AddAccountSteps from "./AddAccountSteps";

const AddAccountModal = memo(() => {
  const [accModalOpened, setAccModalOpened] = useAtom(addAccountModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setAccModalOpened([open, "replace"]);
    },
    [setAccModalOpened]
  );

  return (
    <Dialog.Root open={accModalOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/25" />

        <Dialog.Content
          className={classNames(
            "fixed z-20 h-3/4 w-1/2 min-w-[40rem]",
            "max-w-max m-auto inset-x-0 inset-y-0 p-4 bg-black/95 overflow-y-scroll",
            "rounded-3xl"
          )}
        >
          {/* <Dialog.Title />
          <Dialog.Description />
          <Dialog.Close /> */}

          {accModalOpened && <AddAccountSteps />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default AddAccountModal;
