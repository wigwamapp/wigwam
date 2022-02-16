import { FC, useRef } from "react";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import IconedButton from "app/components/elements/IconedButton";
import LongTextField, {
  LongTextFieldProps,
} from "app/components/elements/LongTextField";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as DownloadIcon } from "app/icons/download.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";

type SeedPhraseFieldProps = LongTextFieldProps & {
  onRegenerate?: () => void;
};

const SeedPhraseField: FC<SeedPhraseFieldProps> = ({
  onRegenerate,
  className,
  ...rest
}) => {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);

  return (
    <div className={classNames("w-full max-w-[27.5rem] relative", className)}>
      <div className="flex items-center justify-between px-4 mb-2">
        <label
          htmlFor="seedPhrase"
          className="text-base text-brand-gray cursor-pointer"
        >
          Secret Phrase
        </label>
        <div className="flex items-center">
          <IconedButton theme="secondary" Icon={EyeIcon} className="mr-2" />
          {!!onRegenerate && (
            <IconedButton
              theme="secondary"
              Icon={RegenerateIcon}
              onClick={onRegenerate}
              className="mr-2"
            />
          )}
          <IconedButton theme="secondary" Icon={DownloadIcon} />
        </div>
      </div>
      <LongTextField ref={fieldRef} className="resize-none" {...rest} />
      <NewButton
        theme="tertiary"
        onClick={copy}
        className={classNames(
          "absolute bottom-[1.125rem] right-3",
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
    </div>
  );
};

export default SeedPhraseField;
