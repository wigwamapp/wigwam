import { FC, ReactNode } from "react";
import classNames from "clsx";

import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";

export interface IPopupModalProps extends SecondaryModalProps {
  children: ReactNode;
  contentClassName?: string;
}

const PopupModal: FC<IPopupModalProps> = (props) => {
  const { children, className, headerClassName, contentClassName } = props;

  return (
    <SecondaryModal
      {...props}
      disabledClickOutside
      headerClassName={classNames("!m-0", headerClassName)}
      className={classNames(
        "!min-w-80 !w-auto !p-5 !rounded-3xl",
        "!items-start !justify-start",
        "!bg-[#2A2D35] !border-none !blur-none",
        className,
      )}
    >
      <div
        className={classNames(
          "w-full pt-8 flex items-start justify-start flex-col",
          contentClassName,
        )}
      >
        {children}
      </div>
    </SecondaryModal>
  );
};

export default PopupModal;
