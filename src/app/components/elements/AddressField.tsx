import { forwardRef } from "react";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";

import LongTextField, { LongTextFieldProps } from "./LongTextField";
import Button from "./Button";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";

export type AddressFieldProps = LongTextFieldProps & {
  setFromClipboard?: (value: string) => void;
  hideLabel?: boolean;
  labelClassName?: string;
};

const AddressField = forwardRef<HTMLTextAreaElement, AddressFieldProps>(
  (
    {
      label = "Recipient",
      setFromClipboard,
      className,
      hideLabel,
      labelClassName,
      ...rest
    },
    ref,
  ) => {
    const { paste, pasted } = usePasteFromClipboard(setFromClipboard);
    const { copy, copied } = useCopyToClipboard(
      rest.value ?? rest.defaultValue,
    );

    return (
      <LongTextField
        ref={ref}
        label={!hideLabel ? label : undefined}
        placeholder="0x0000000000000000000000000000000000000000"
        textareaClassName="!h-20"
        labelClassName={labelClassName}
        maxLength={42}
        actions={
          <Button
            theme="tertiary"
            onClick={() => {
              if (setFromClipboard) {
                paste();
              } else {
                copy();
              }
            }}
            className={classNames(
              "absolute bottom-3 right-3",
              "text-sm text-brand-light",
              "!p-0 !pr-1 !min-w-0",
              "!font-normal",
              "items-center",
            )}
          >
            {setFromClipboard ? (
              <>
                {pasted ? (
                  <SuccessIcon className="mr-1" />
                ) : (
                  <PasteIcon className="mr-1" />
                )}
                {pasted ? "Pasted" : "Paste"}
              </>
            ) : (
              <>
                {copied ? (
                  <SuccessIcon className="mr-1" />
                ) : (
                  <CopyIcon className="mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </>
            )}
          </Button>
        }
        className={className}
        {...rest}
      />
    );
  },
);

export default AddressField;
