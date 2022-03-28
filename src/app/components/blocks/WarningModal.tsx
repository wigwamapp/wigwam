import { FC } from "react";

import { useWarning } from "app/hooks/warning";
import SecondaryModal from "app/components/elements/SecondaryModal";
import NewButton from "app/components/elements/NewButton";

const WarningModal: FC = () => {
  const { modalData } = useWarning();

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
      <div className="text-base font-brand-font text-center">{children}</div>
      <div className="flex mt-5">
        <NewButton onClick={onPrimaryButtonClick}>
          {primaryButtonText}
        </NewButton>
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
    </SecondaryModal>
  );
};

export default WarningModal;
