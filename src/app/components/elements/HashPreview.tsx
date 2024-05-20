import { memo } from "react";
import classNames from "clsx";

import CopiableTooltip from "app/components/elements/CopiableTooltip";

export const getHashPreview = (hash: string, startLength = 6, endLength = 4) =>
  `${hash.slice(0, startLength)}...${hash.slice(
    hash.length - endLength,
    hash.length,
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
    if (hash.length > startLength + endLength) {
      const content = (
        <span className={classNames("inline-flex", className)}>
          {getHashPreview(hash, startLength, endLength)}
        </span>
      );

      if (withTooltip) {
        return (
          <CopiableTooltip content={hash} textToCopy={hash} maxWidth="22rem">
            {content}
          </CopiableTooltip>
        );
      }

      return content;
    }

    return <span className={className}>{hash}</span>;
  },
);

export default HashPreview;
