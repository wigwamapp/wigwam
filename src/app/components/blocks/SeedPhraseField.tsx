import { forwardRef, ReactNode, useRef } from "react";
import classNames from "clsx";
import mergeRefs from "react-merge-refs";
import { useCopyToClipboardWithMutator } from "lib/react-hooks/useCopyToClipboardWithMutator";
import { usePasteToClipboardWithMutator } from "lib/react-hooks/usePasteToClipboardWithMutator";

import IconedButton from "app/components/elements/IconedButton";
import LongTextField, {
  LongTextFieldProps,
} from "app/components/elements/LongTextField";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as DownloadIcon } from "app/icons/download.svg";
import { ReactComponent as UploadIcon } from "app/icons/upload.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { TippySingletonProvider } from "app/hooks";

type SeedPhraseFieldProps = LongTextFieldProps & {
  mode?: "create" | "import";
  mutator?: (value: string) => void;
  onRegenerate?: () => void;
  value: string;
};

const SeedPhraseField = forwardRef<HTMLTextAreaElement, SeedPhraseFieldProps>(
  ({ mode = "create", onRegenerate, mutator, className, ...rest }, ref) => {
    const fieldRef = useRef<HTMLTextAreaElement>(null);
    const { copy, copied } = useCopyToClipboardWithMutator(rest.value);
    const { paste, pasted } = usePasteToClipboardWithMutator(mutator);

    let buttonContent: ReactNode | undefined;

    if (mode === "create") {
      buttonContent = (
        <>
          {copied ? (
            <SuccessIcon className="mr-1" />
          ) : (
            <CopyIcon className="mr-1" />
          )}
          {copied ? "Copied" : "Copy"}
        </>
      );
    }

    if (mode === "import") {
      buttonContent = (
        <>
          {pasted ? (
            <SuccessIcon className="mr-1" />
          ) : (
            <PasteIcon className="mr-1" />
          )}
          {pasted ? "Pasted" : "Paste"}
        </>
      );
    }

    return (
      <div className={classNames("w-full max-w-[27.5rem] relative", className)}>
        <LongTextField
          ref={mergeRefs([ref, fieldRef])}
          id="seedPhrase"
          label="Secret Phrase"
          actions={
            <div className="flex items-center">
              <TippySingletonProvider>
                <IconedButton
                  aria-label="Show / hide"
                  Icon={EyeIcon}
                  className="mr-2"
                  theme="secondary"
                />
                {mode === "create" && !!onRegenerate && (
                  <IconedButton
                    aria-label="Regenerate secret phrase"
                    Icon={RegenerateIcon}
                    onClick={onRegenerate}
                    className="mr-2"
                    theme="secondary"
                  />
                )}
                <IconedButton
                  aria-label={
                    mode === "create"
                      ? "Download secret phrase"
                      : "Upload secret phrase"
                  }
                  Icon={mode === "create" ? DownloadIcon : UploadIcon}
                  theme="secondary"
                />
              </TippySingletonProvider>
            </div>
          }
          {...rest}
        />
        {buttonContent && (
          <NewButton
            type="button"
            theme="tertiary"
            onClick={mode === "create" ? copy : paste}
            className={classNames(
              "absolute bottom-[1.125rem] right-3",
              "text-sm text-brand-light",
              "!p-0 !pr-1 !min-w-0",
              "!font-normal",
              "cursor-copy",
              "items-center"
            )}
          >
            {buttonContent}
          </NewButton>
        )}
      </div>
    );
  }
);

export default SeedPhraseField;
