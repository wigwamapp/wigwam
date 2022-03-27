import { FC } from "react";

import { useWarning } from "app/hooks/warning";
import SecondaryModal from "app/components/elements/SecondaryModal";
import NewButton from "app/components/elements/NewButton";

const WarningModal: FC = () => {
  const { modalData, setModalData } = useWarning();

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
    ...rest
  } = modalData;

  const handleButtonClick = (callback?: () => void) => {
    setModalData(null);
    callback?.();
  };

  return (
    <SecondaryModal
      open={true}
      onOpenChange={() => setModalData(null)}
      header={header}
      {...rest}
    >
      <div className="text-base font-brand-font text-center">{children}</div>
      <div className="flex mt-5">
        <NewButton onClick={() => handleButtonClick(onPrimaryButtonClick)}>
          {primaryButtonText}
        </NewButton>
        {secondaryButtonText && (
          <NewButton
            theme="secondary"
            onClick={() => handleButtonClick(onSecondaryButtonClick)}
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
