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
  const { children, className, headerClassName, contentClassName, open } =
    props;

  return (
    <SecondaryModal
      {...props}
      headerClassName={classNames("!m-0", headerClassName)}
      className={classNames(
        "!p-5",
        "!items-start !justify-start",
        "!max-w-[20.75rem]",
        className,
      )}
    >
      {open ? (
        <div
          className={classNames(
            "w-full pt-8 flex items-start justify-start flex-col",
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </SecondaryModal>
  );
};

export default PopupModal;
