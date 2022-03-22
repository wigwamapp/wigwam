import { FC, useRef } from "react";

import TokenSelect from "app/components/elements/TokenSelect";
import LongTextField from "../../elements/LongTextField";
import classNames from "clsx";
import NewButton from "../../elements/NewButton";
import { ReactComponent as SuccessIcon } from "../../../icons/success.svg";
import { ReactComponent as PasteIcon } from "../../../icons/paste.svg";
import { usePasteToClipboard } from "../../../../lib/react-hooks/usePasteToClipboard";

const Asset: FC = () => {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const { paste, pasted } = usePasteToClipboard(fieldRef);

  return (
    <div className="flex flex-col">
      <TokenSelect />
      <div className="relative">
        <LongTextField ref={fieldRef} label="Recipient" />
        <NewButton
          theme="tertiary"
          onClick={paste}
          className={classNames(
            "absolute bottom-[1.125rem] right-3",
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
      </div>
    </div>
  );
};

export default Asset;
