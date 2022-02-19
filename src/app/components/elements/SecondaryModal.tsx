import { FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import classNames from "clsx";

import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";

export type SecondaryModalProps = DialogProps & {
  className?: string;
};

const SecondaryModal: FC<SecondaryModalProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger />
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-brand-darkblue/50" />
        <Dialog.Content
          className={classNames(
            "fixed z-20",
            "max-w-[43rem] w-full p-[3.75rem]",
            "m-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "bg-brand-main/[.05]",
            "border border-brand-main/[.15]",
            "backdrop-blur-[40px]",
            "rounded-[1.875rem]",
            "overflow-hidden",
            "flex flex-col justify-center items-center"
          )}
        >
          <Dialog.Close asChild className="fixed top-4 right-4">
            <IconedButton Icon={CloseIcon} theme="tertiary" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SecondaryModal;
