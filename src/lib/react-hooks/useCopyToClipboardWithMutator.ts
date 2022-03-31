import { useCallback, useEffect, useState } from "react";

export function useCopyToClipboardWithMutator(
  value: string,
  copyDelay: number = 1000 * 2
) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, copyDelay);

      return () => clearTimeout(timeout);
    }

    return;
  }, [copied, setCopied, copyDelay]);

  const copy = useCallback(() => {
    if (copied) return;

    navigator.clipboard.writeText(value);
    setCopied(true);
  }, [value, copied, setCopied]);

  return { copy, copied, setCopied };
}
