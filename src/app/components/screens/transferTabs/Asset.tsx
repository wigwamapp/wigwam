import { FC, useRef } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { usePasteToClipboard } from "lib/react-hooks/usePasteToClipboard";

import { AccountAsset } from "core/types";

import { tokenSlugAtom } from "app/atoms";
import { useToken } from "app/hooks/tokens";
import TokenSelect from "app/components/elements/TokenSelect";
import LongTextField from "app/components/elements/LongTextField";
import NewButton from "app/components/elements/NewButton";
import Input from "app/components/elements/Input";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";

const Asset: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const currentToken = useToken(tokenSlug) as AccountAsset;

  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const { paste, pasted } = usePasteToClipboard(fieldRef);

  return (
    <div className="flex flex-col">
      <TokenSelect />
      <div className="relative mt-5">
        <LongTextField
          ref={fieldRef}
          label="Recipient"
          placeholder="0x0000000000000000000000000000000000000000"
          textareaClassName="!h-20"
        />
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
      <div className="relative mt-5">
        <Input
          label="Amount"
          placeholder="0.00"
          actions={
            <button
              type="button"
              className={classNames(
                "py-1 px-3",
                "bg-brand-main/10",
                "rounded-md",
                "text-xs font-bold",
                "transition-colors",
                "hover:bg-brand-main/30 hover:shadow-buttonsecondary",
                "focus-visible:bg-brand-main/30 focus-visible:shadow-buttonsecondary",
                "active:bg-brand-main/20 active:shadow-none"
              )}
            >
              MAX
            </button>
          }
          inputClassName="pr-20"
        />
        {currentToken && (
          <span
            className={classNames(
              "absolute top-11 right-4",
              "text-sm font-bold"
            )}
          >
            {currentToken.symbol}
          </span>
        )}
      </div>
      <div className="mt-6 flex items-start">
        <Tooltip
          content={
            <>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                aliquam, purus sit amet luctus venenatis, lectus magna fringilla
                urna, porttitor rhoncus dolor purus non enim praesent elementum
                facilisis leo
              </p>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                aliquam, purus sit amet luctus venenatis, lectus magna fringilla
                urna, porttitor rhoncus
              </p>
            </>
          }
          placement="left-start"
          size="large"
          className="mr-2"
        >
          <TooltipIcon />
        </Tooltip>
        <div className="flex flex-col">
          <SummaryRow
            header="Amount: 311.5 USDT"
            value="$312.55"
            className="mb-1"
          />
          <SummaryRow
            header="Average Fee: 0.13 ETH"
            value="$9.55"
            className="mb-1"
          />
          <SummaryRow header="Total: $9.55" />
        </div>
      </div>
      <NewButton className="flex items-center min-w-[13.75rem] mt-8 mx-auto">
        <SendIcon className="mr-2" />
        Transfer
      </NewButton>
    </div>
  );
};

export default Asset;

type SummaryRowProps = {
  header: string;
  value?: string;
  className?: string;
};

const SummaryRow: FC<SummaryRowProps> = ({ header, value, className }) => (
  <div className={classNames("flex items-center", "text-sm", className)}>
    <h4 className="font-bold">{header}</h4>
    {value && <span className="text-brand-inactivedark ml-1">({value})</span>}
  </div>
);
