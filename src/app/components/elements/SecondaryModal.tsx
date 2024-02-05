import { FC, PropsWithChildren, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import classNames from "clsx";

import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";

export type SecondaryModalProps = DialogProps &
  PropsWithChildren<{
    header?: ReactNode;
    disabledClickOutside?: boolean;
    closeButton?: boolean;
    closeButtonClassName?: string;
    autoFocus?: boolean;
    className?: string;
    headerClassName?: string;
    small?: boolean;
  }>;

const SecondaryModal: FC<SecondaryModalProps> = ({
  header,
  disabledClickOutside,
  closeButton = true,
  closeButtonClassName,
  autoFocus,
  open,
  onOpenChange,
  children,
  className,
  headerClassName,
  small,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames(
            "fixed inset-0 z-30",
            "bg-black/50 backdrop-blur-md",
          )}
        />
        <Dialog.Content
          className={classNames(
            "fixed z-30 w-full",
            small ? "max-w-[22.25rem]" : "max-w-[43rem]",
            small ? "p-[1.75rem]" : "p-[3.75rem]",
            "m-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "bg-brand-darkgray",
            "rounded-3xl",
            "overflow-hidden",
            "animate-dialogcontent",
            "flex flex-col justify-center items-center",
            className,
          )}
          onOpenAutoFocus={!autoFocus ? (e) => e.preventDefault() : undefined}
          onPointerDownOutside={
            disabledClickOutside ? (e) => e.preventDefault() : undefined
          }
        >
          {header && (
            <h2
              className={classNames(
                !small && "mb-8",
                small && "mt-3 mb-4",
                !small && "text-2xl",
                small && "text-xl",
                "text-center font-bold",
                headerClassName,
              )}
            >
              {header}
            </h2>
          )}

          {children}

          {closeButton && (
            <Dialog.Close
              asChild
              className={classNames(
                "fixed top-4 right-4",
                closeButtonClassName,
              )}
            >
              <IconedButton
                Icon={CloseIcon}
                aria-label="Close"
                theme="tertiary"
              />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SecondaryModal;
