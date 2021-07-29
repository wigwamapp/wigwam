import { memo } from "react";

type HashPreviewProps = {
  hash: string;
  startLength?: number;
  endLength?: number;
};

export const HashPreview = memo<HashPreviewProps>(
  ({ hash, startLength = 6, endLength = 4 }) =>
    hash.length > startLength + endLength ? (
      <span className="inline-flex">
        {hash.slice(0, startLength)}
        <span className="opacity-75">...</span>
        {hash.slice(hash.length - endLength, hash.length)}
      </span>
    ) : (
      <>{hash}</>
    )
);

export default HashPreview;
