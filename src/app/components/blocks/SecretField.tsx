import { forwardRef, RefObject, useEffect, useState } from "react";
import classNames from "clsx";
import { encodeBase58 } from "ethers";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { useWindowInteracted } from "lib/react-hooks/useWindowInteracted";

import { getRandomBytes } from "lib/crypto-utils/random";
import { downloadFile } from "lib/download";

import { TippySingletonProvider } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import IconedButton from "app/components/elements/IconedButton";
import { LongTextFieldProps } from "app/components/elements/LongTextField";
import ContentEditableField, {
  ContentEditableFieldProps,
} from "app/components/elements/ContentEditableField";
import Button from "app/components/elements/Button";
import Input, { InputProps } from "app/components/elements/Input";
import CanvasTextField, {
  CanvasTextFieldProps,
} from "app/components/elements/CanvasTextField";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as DownloadIcon } from "app/icons/download.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as HiddenSeedPhraseIcon } from "app/icons/hidden-seed-phrase.svg";
import { ReactComponent as LockIcon } from "app/icons/lock.svg";

type SecretFieldBaseProps = {
  isDownloadable?: boolean;
};

type SecretFieldProps = CreateSecretFieldProps | ImportSecretFieldProps;

const SecretField = forwardRef<
  HTMLTextAreaElement | HTMLInputElement | HTMLCanvasElement,
  SecretFieldProps
>(({ label = "Secret phrase", className, ...rest }, ref) => (
  <div className={classNames("w-full max-w-[27.5rem] relative", className)}>
    {"setFromClipboard" in rest ? (
      <ImportSecretField
        ref={ref as RefObject<HTMLTextAreaElement | HTMLInputElement>}
        label={label}
        {...rest}
      />
    ) : (
      <CreateSecretField
        ref={ref as RefObject<HTMLCanvasElement>}
        label={label}
        {...rest}
      />
    )}
  </div>
));

export default SecretField;

type CreateSecretFieldProps = SecretFieldBaseProps &
  (LongTextFieldProps | InputProps | CanvasTextFieldProps) & {
    onRegenerate?: () => void;
  };

const CreateSecretField = forwardRef<HTMLCanvasElement, CreateSecretFieldProps>(
  ({ label = "Secret phrase", isDownloadable, onRegenerate, ...rest }, ref) => {
    const { copy, copied } = useCopyToClipboard();
    const [isShown, setIsShown] = useState(false);

    const { confirm } = useDialog();
    const windowFocused = useWindowFocus();
    const windowInteracted = useWindowInteracted();

    useEffect(() => {
      if (!windowFocused || !windowInteracted) {
        setIsShown(false);
      }
    }, [windowFocused, windowInteracted]);

    const handleDownload = () => {
      const value = (rest.value ?? rest.defaultValue) as string;
      if (isDownloadable && value) {
        confirm({
          title: "Download Secret Phrase",
          content: `
        WARNING: Never disclose your Secret Phrase. Anyone with this phrase can take your funds forever.
        Download this Secret Phrase and keep it stored safely on an external encrypted hard drive or storage medium.`,
        }).then((answer) => {
          if (answer) {
            const name = encodeBase58(getRandomBytes(10));
            downloadFile(value, name, "text/richtext");
          }
        });
      }
    };

    const labelActions = (
      <div className="flex items-center">
        <TippySingletonProvider>
          <IconedButton
            aria-label={`${isShown ? "Hide" : "Show"} ${label.toLowerCase()}`}
            Icon={isShown ? EyeIcon : OpenedEyeIcon}
            theme="secondary"
            onClick={() => setIsShown((prevState) => !prevState)}
          />
          {onRegenerate && (
            <IconedButton
              aria-label={`Regenerate ${label.toLowerCase()}`}
              Icon={RegenerateIcon}
              onClick={onRegenerate}
              className="ml-2"
              theme="secondary"
            />
          )}
          {isDownloadable && (
            <IconedButton
              aria-label={`Download ${label.toLowerCase()}`}
              onClick={handleDownload}
              Icon={DownloadIcon}
              theme="secondary"
              className="ml-2"
            />
          )}
        </TippySingletonProvider>
      </div>
    );

    const copyButton = (
      <Button
        theme="tertiary"
        onClick={(evt: any) => {
          evt.preventDefault();
          evt.stopPropagation();
          copy(rest.value ?? rest.defaultValue);
        }}
        className={classNames(
          "absolute",
          "text-sm text-brand-light",
          "!p-0 !pr-1 !min-w-0",
          "!font-normal",
          "items-center",
          isShown
            ? "bottom-3 right-3"
            : "bottom-[calc(.75rem-1px)] right-[calc(.75rem-1px)]",
        )}
      >
        {copied ? (
          <SuccessIcon className="mr-1" />
        ) : (
          <CopyIcon className="mr-1" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    );

    const actions = isShown ? (
      copyButton
    ) : (
      <div
        className={classNames(
          "absolute z-10",
          "inset-0 box-border",
          "rounded-[.5625rem]",
          "bg-[#1E2C31] bg-opacity-75",
          "border border-brand-main/10",
          "flex flex-col items-center justify-center",
          "transition-opacity",
          isShown ? "opacity-0 pointer-events-none" : "cursor-pointer",
        )}
        onClick={isShown ? undefined : () => setIsShown(true)}
        onKeyDown={isShown ? undefined : () => setIsShown(true)}
      >
        <HiddenSeedPhraseIcon className="w-full h-auto absolute inset-0" />
        <LockIcon className="w-[2.125rem] h-auto" />
        <span className="text-xs font-bold mt-1">
          Click here to reveal a {label.toLowerCase()}
        </span>
        {copyButton}
      </div>
    );

    return (
      <CanvasTextField
        ref={ref}
        label={label}
        labelActions={labelActions}
        actions={actions}
        canvasClassName={isShown ? "z-0 relative" : "text-transparent"}
        {...(rest as CanvasTextFieldProps)}
        value={isShown ? (rest.value as string) : ""}
      />
    );
  },
);

type ImportSecretFieldProps = SecretFieldBaseProps &
  (LongTextFieldProps | InputProps) & {
    setFromClipboard: (value: string) => void;
  };

const ImportSecretField = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  ImportSecretFieldProps
>(({ label = "Secret phrase", setFromClipboard, ...rest }, ref) => {
  const { paste, pasted } = usePasteFromClipboard(setFromClipboard);
  const [isShown, setIsShown] = useState(false);

  const labelActions = (
    <div className="flex items-center">
      <TippySingletonProvider>
        <IconedButton
          aria-label={`${isShown ? "Hide" : "Show"} ${label.toLowerCase()}`}
          Icon={isShown ? EyeIcon : OpenedEyeIcon}
          theme="secondary"
          onClick={() => setIsShown((prevState) => !prevState)}
        />
        {/*<IconedButton*/}
        {/*  aria-label={`Upload ${label.toLowerCase()}`}*/}
        {/*  Icon={UploadIcon}*/}
        {/*  theme="secondary"*/}
        {/*  className="ml-2"*/}
        {/*/>*/}
      </TippySingletonProvider>
    </div>
  );

  const actions = (
    <Button
      theme="tertiary"
      onClick={paste}
      className={classNames(
        isShown && "absolute bottom-3 right-3",
        "text-sm text-brand-light",
        "!p-0 !pr-1 !min-w-0",
        "!font-normal",
        "items-center",
      )}
    >
      {pasted ? (
        <SuccessIcon className="mr-1" />
      ) : (
        <PasteIcon className="mr-1" />
      )}
      {pasted ? "Pasted" : "Paste"}
    </Button>
  );

  return !isShown ? (
    <Input
      ref={ref as RefObject<HTMLInputElement>}
      type="password"
      label={label}
      labelActions={labelActions}
      actions={actions}
      inputClassName="pb-[4.90625rem] !pr-4"
      actionsClassName="absolute !top-auto bottom-3 flex transform-none"
      {...(rest as InputProps)}
    />
  ) : (
    <>
      {/* <LongTextField
        ref={ref as RefObject<HTMLTextAreaElement>}
        label={label}
        labelActions={labelActions}
        actions={actions}
        {...(rest as LongTextFieldProps)}
      /> */}

      <ContentEditableField
        ref={ref as RefObject<HTMLDivElement>}
        label={label}
        labelActions={labelActions}
        actions={actions}
        {...(rest as ContentEditableFieldProps)}
      />
    </>
  );
});
