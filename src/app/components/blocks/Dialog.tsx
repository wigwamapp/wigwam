import { FC } from "react";

import { useDialog } from "app/hooks/dialog";
import SecondaryModal from "app/components/elements/SecondaryModal";
import NewButton from "app/components/elements/NewButton";

const Dialog: FC = () => {
  const { modalData } = useDialog();

  if (!modalData) {
    return null;
  }

  const {
    header,
    children,
    primaryButtonText,
    onPrimaryButtonClick,
    secondaryButtonText,
    onSecondaryButtonClick,
    onClose,
    ...rest
  } = modalData;

  return (
    <SecondaryModal
      open={true}
      onOpenChange={onClose}
      header={header}
      {...rest}
    >
      <div className="text-base text-brand-font text-center w-full break-words flex flex-col items-center">
        {children}
      </div>
      {(primaryButtonText || secondaryButtonText) && (
        <div className="flex mt-5">
          {primaryButtonText && (
            <NewButton onClick={onPrimaryButtonClick}>
              {primaryButtonText}
            </NewButton>
          )}
          {secondaryButtonText && (
            <NewButton
              theme="secondary"
              onClick={onSecondaryButtonClick}
              className="ml-3"
            >
              {secondaryButtonText}
            </NewButton>
          )}
        </div>
      )}
    </SecondaryModal>
  );
};

export default Dialog;
