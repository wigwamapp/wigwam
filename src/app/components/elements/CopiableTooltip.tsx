import { FC, ComponentProps, useCallback, useRef, useEffect } from "react";
import classNames from "clsx";
import * as Tippy from "tippy.js";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import Tooltip from "./Tooltip";

type CopiableTooltipProps = ComponentProps<typeof Tooltip> & {
  textToCopy: string;
  copiedText?: string;
  onCopiedToggle?: (state: boolean) => void;
};

const CopiableTooltip: FC<CopiableTooltipProps> = ({
  textToCopy,
  content,
  onHidden,
  copiedText = "Copied",
  onCopiedToggle,
  children,
  className,
  ...rest
}) => {
  const copyFieldRef = useRef<HTMLInputElement>(null);
  const { copy, copied, setCopied } = useCopyToClipboard(copyFieldRef);

  const handleTooltipHidden = useCallback(
    (instance: Tippy.Instance<Tippy.Props>) => {
      setCopied(false);
      onHidden?.(instance);
    },
    [onHidden, setCopied]
  );

  useEffect(() => {
    onCopiedToggle?.(copied);
  }, [copied, onCopiedToggle]);

  return (
    <>
      <Tooltip
        {...rest}
        content={copied ? copiedText : content}
        onHidden={handleTooltipHidden}
        asChild
        missSingleton
      >
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copy();
          }}
          className={classNames("cursor-pointer", className)}
        >
          {children}
        </button>
      </Tooltip>

      {textToCopy && (
        <input
          ref={copyFieldRef}
          value={textToCopy}
          onChange={() => undefined}
          tabIndex={-1}
          className="sr-only"
        />
      )}
    </>
  );
};

export default CopiableTooltip;
