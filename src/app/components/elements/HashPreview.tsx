import { memo } from "react";
import classNames from "clsx";

type HashPreviewProps = {
  hash: string;
  startLength?: number;
  endLength?: number;
  className?: string;
};

export const HashPreview = memo<HashPreviewProps>(
  ({ hash, startLength = 6, endLength = 4, className }) =>
    hash.length > startLength + endLength ? (
      <span className={classNames("inline-flex", className)}>
        {hash.slice(0, startLength)}
        <span className="opacity-75">...</span>
        {hash.slice(hash.length - endLength, hash.length)}
      </span>
    ) : (
      <span className={className}>{hash}</span>
    )
);

export default HashPreview;
