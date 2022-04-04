import { forwardRef, RefObject } from "react";
import classNames from "clsx";

import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";
import LongTextField, { LongTextFieldProps } from "./LongTextField";
import NewButton from "./NewButton";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

type AddressFieldProps = LongTextFieldProps & {
  setFromClipboard?: (value: string) => void;
};

const AddressField = forwardRef<HTMLTextAreaElement, AddressFieldProps>(
  ({ setFromClipboard, className, ...rest }, ref) => {
    const { paste, pasted } = usePasteFromClipboard(setFromClipboard);
    const { copy, copied } = useCopyToClipboard(
      ref as RefObject<HTMLTextAreaElement>
    );

    return (
      <div className={classNames("relative", className)}>
        <LongTextField
          ref={ref}
          label="Recipient"
          placeholder="0x0000000000000000000000000000000000000000"
          textareaClassName="!h-20"
          maxLength={42}
          {...rest}
        />
        <NewButton
          theme="tertiary"
          onClick={() => {
            console.log(`set`, setFromClipboard);
            if (setFromClipboard) {
              paste();
            } else {
              copy();
            }
          }}
          className={classNames(
            "absolute bottom-[1.125rem] right-3",
            "text-sm text-brand-light",
            "!p-0 !pr-1 !min-w-0",
            "!font-normal",
            "cursor-copy",
            "items-center"
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
        </NewButton>
      </div>
    );
  }
);

export default AddressField;
