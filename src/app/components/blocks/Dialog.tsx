import { FC } from "react";

import { useDialog } from "app/hooks/dialog";
import SecondaryModal from "app/components/elements/SecondaryModal";
import Button from "app/components/elements/Button";

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

  const withActions = Boolean(primaryButtonText || secondaryButtonText);

  return (
    <SecondaryModal
      open={true}
      onOpenChange={onClose}
      header={header}
      autoFocus={withActions}
      {...rest}
    >
      <div className="text-base text-brand-font text-center w-full break-words flex flex-col items-center">
        {children}
      </div>
      {withActions && (
        <div className="flex flex-row-reverse mt-5">
          {primaryButtonText && (
            <Button plainFocus onClick={onPrimaryButtonClick}>
              {primaryButtonText}
            </Button>
          )}

          {secondaryButtonText && (
            <Button
              theme="secondary"
              plainFocus
              className="mr-3"
              onClick={onSecondaryButtonClick}
            >
              {secondaryButtonText}
            </Button>
          )}
        </div>
      )}
    </SecondaryModal>
  );
};

export default Dialog;
