import { forwardRef, RefObject, useRef, useState } from "react";
import classNames from "clsx";
import mergeRefs from "react-merge-refs";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";
import { ethers } from "ethers";

import { getRandomBytes } from "lib/crypto-utils/random";
import { downloadFile } from "lib/download";

import { TippySingletonProvider } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import IconedButton from "app/components/elements/IconedButton";
import LongTextField, {
  LongTextFieldProps,
} from "app/components/elements/LongTextField";
import NewButton from "app/components/elements/NewButton";
import Input, { InputProps } from "app/components/elements/Input";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as DownloadIcon } from "app/icons/download.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
// import { ReactComponent as UploadIcon } from "app/icons/upload.svg";

type SeedPhraseFieldProps =
  | CreateSeedPhraseFieldProps
  | ImportSeedPhraseFieldProps;

const SeedPhraseField = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  SeedPhraseFieldProps
>(({ className, ...rest }, ref) => (
  <div className={classNames("w-full max-w-[27.5rem] relative", className)}>
    {"setFromClipboard" in rest ? (
      <ImportSeedPhraseField ref={ref} {...rest} />
    ) : (
      <CreateSeedPhraseField ref={ref} {...rest} />
    )}
  </div>
));

export default SeedPhraseField;

type CreateSeedPhraseFieldProps = (LongTextFieldProps | InputProps) & {
  onRegenerate?: () => void;
};

const CreateSeedPhraseField = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  CreateSeedPhraseFieldProps
>(({ onRegenerate, ...rest }, ref) => {
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);
  const [isShown, setIsShown] = useState(false);

  const { confirm } = useDialog();

  const handleDownload = () => {
    const value = rest.value as string;
    if (value) {
      confirm({
        title: "Download Secret Phrase",
        content: `
        WARNING: Never disclose your Secret Recovery Phrase. Anyone with this phrase can take your Ether forever.
        Download this Secret Recovery Phrase and keep it stored safely on an external encrypted hard drive or storage medium.`,
      }).then((answer) => {
        if (answer) {
          const name = ethers.utils.base58.encode(getRandomBytes(10));
          downloadFile(value, name, "text/richtext");
        }
      });
    }
  };

  const labelActions = (
    <div className="flex items-center">
      <TippySingletonProvider>
        <IconedButton
          aria-label="Show / hide"
          Icon={EyeIcon}
          className="mr-2"
          theme="secondary"
          onClick={() => setIsShown((prevState) => !prevState)}
        />
        {onRegenerate && (
          <IconedButton
            aria-label="Regenerate secret phrase"
            Icon={RegenerateIcon}
            onClick={onRegenerate}
            className="mr-2"
            theme="secondary"
          />
        )}
        <IconedButton
          aria-label="Download secret phrase"
          onClick={handleDownload}
          Icon={DownloadIcon}
          theme="secondary"
        />
      </TippySingletonProvider>
    </div>
  );

  const actions = (
    <NewButton
      type="button"
      theme="tertiary"
      onClick={copy}
      className={classNames(
        "absolute bottom-3 right-3",
        "text-sm text-brand-light",
        "!p-0 !pr-1 !min-w-0",
        "!font-normal",
        "cursor-copy",
        "items-center"
      )}
    >
      {copied ? (
        <SuccessIcon className="mr-1" />
      ) : (
        <CopyIcon className="mr-1" />
      )}
      {copied ? "Copied" : "Copy"}
    </NewButton>
  );

  console.log(rest);

  return isShown ? (
    <LongTextField
      ref={mergeRefs([ref as RefObject<HTMLTextAreaElement>, fieldRef])}
      id="seedPhrase"
      label="Secret Phrase"
      readOnly
      labelActions={labelActions}
      actions={actions}
      {...rest}
    />
  ) : (
    <Input
      ref={mergeRefs([ref as RefObject<HTMLInputElement>, fieldRef])}
      type="password"
      id="seedPhrase"
      label="Secret Phrase"
      labelActions={labelActions}
      inputClassName="pb-[4.90625rem]"
      {...(rest as InputProps)}
    />
  );
});

type ImportSeedPhraseFieldProps = LongTextFieldProps & {
  setFromClipboard: (value: string) => void;
};

const ImportSeedPhraseField = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  ImportSeedPhraseFieldProps
>(({ setFromClipboard, ...rest }, ref) => {
  const { paste, pasted } = usePasteFromClipboard(setFromClipboard);
  const [isShown, setIsShown] = useState(false);

  const labelActions = (
    <div className="flex items-center">
      <TippySingletonProvider>
        <IconedButton
          aria-label="Show / hide"
          Icon={EyeIcon}
          theme="secondary"
          onClick={() => setIsShown((prevState) => !prevState)}
        />
        {/*<IconedButton*/}
        {/*  aria-label="Upload secret phrase"*/}
        {/*  Icon={UploadIcon}*/}
        {/*  theme="secondary"*/}
        {/*  className="ml-2"*/}
        {/*/>*/}
      </TippySingletonProvider>
    </div>
  );

  const actions = (
    <NewButton
      type="button"
      theme="tertiary"
      onClick={paste}
      className={classNames(
        isShown && "absolute bottom-3 right-3",
        "text-sm text-brand-light",
        "!p-0 !pr-1 !min-w-0",
        "!font-normal",
        "cursor-copy",
        "items-center"
      )}
    >
      {pasted ? (
        <SuccessIcon className="mr-1" />
      ) : (
        <PasteIcon className="mr-1" />
      )}
      {pasted ? "Pasted" : "Paste"}
    </NewButton>
  );

  return isShown ? (
    <LongTextField
      ref={ref as RefObject<HTMLTextAreaElement>}
      id="seedPhrase"
      label="Secret Phrase"
      labelActions={labelActions}
      actions={actions}
      {...rest}
    />
  ) : (
    <Input
      ref={ref as RefObject<HTMLInputElement>}
      type="password"
      id="seedPhrase"
      label="Secret Phrase"
      labelActions={labelActions}
      actions={actions}
      inputClassName="pb-[4.90625rem] !pr-4"
      actionsClassName="absolute !top-auto bottom-3 flex transform-none"
      {...(rest as InputProps)}
    />
  );
});
