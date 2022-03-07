import { memo, useRef } from "react";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import Tooltip from "app/components/elements/Tooltip";

export const getHashPreview = (hash: string, startLength = 6, endLength = 4) =>
  `${hash.slice(0, startLength)}...${hash.slice(
    hash.length - endLength,
    hash.length
  )}`;

type HashPreviewProps = {
  hash: string;
  startLength?: number;
  endLength?: number;
  withTooltip?: boolean;
  className?: string;
};

export const HashPreview = memo<HashPreviewProps>(
  ({ hash, startLength = 6, endLength = 4, withTooltip = true, className }) => {
    const fieldRef = useRef<HTMLInputElement>(null);
    const { copy, copied } = useCopyToClipboard(fieldRef);

    if (hash.length > startLength + endLength) {
      const content = (
        <span className={classNames("inline-flex", className)}>
          {getHashPreview(hash, startLength, endLength)}
        </span>
      );

      if (withTooltip) {
        return (
          <>
            <Tooltip
              content={`${hash}${copied ? " copied" : ""}`}
              size="small"
              asChild
            >
              <button onClick={copy}>{content}</button>
            </Tooltip>

            <input
              ref={fieldRef}
              defaultValue={hash}
              tabIndex={-1}
              className="sr-only"
            />
          </>
        );
      }

      return content;
    }

    return <span className={className}>{hash}</span>;
  }
);

export default HashPreview;
