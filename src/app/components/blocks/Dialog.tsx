import { FC } from "react";
import classNames from "clsx";

import { useDialog } from "app/hooks/dialog";
import SecondaryModal from "app/components/elements/SecondaryModal";
import Button from "app/components/elements/Button";

const Dialog: FC<{ small?: boolean }> = ({ small }) => {
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
    buttonTheme,
    ...rest
  } = modalData;

  const withActions = Boolean(primaryButtonText || secondaryButtonText);

  return (
    <SecondaryModal
      open={true}
      onOpenChange={onClose}
      header={header}
      autoFocus={withActions}
      small={small}
      {...rest}
    >
      <div
        className={classNames(
          !small && "text-base",
          small && "text-sm",
          "text-brand-font text-center w-full break-words flex flex-col items-center",
        )}
      >
        {children}
      </div>
      {withActions && (
        <div
          className={classNames(
            "flex flex-row-reverse",
            !small && "mt-5",
            small && "mt-3",
          )}
        >
          {primaryButtonText && (
            <Button
              plainFocus
              theme={buttonTheme?.primary ?? "primary"}
              onClick={onPrimaryButtonClick}
              className={classNames(small ? "!py-2" : "")}
            >
              {primaryButtonText}
            </Button>
          )}

          {secondaryButtonText && (
            <Button
              theme={buttonTheme?.secondary ?? "secondary"}
              plainFocus
              className={classNames(small && "!py-2", "mr-3")}
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
