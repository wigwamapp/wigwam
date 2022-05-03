import { useCallback, useEffect, useState } from "react";

export function useCopyCanvasToClipboard(
  querySelector: string,
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

  const copy = useCallback(async () => {
    if (copied) return;

    const canvas = document.querySelector(querySelector) as
      | HTMLCanvasElement
      | undefined;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.canvas.toBlob((blob) => {
          if (blob) {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]);
            setCopied(true);
          }
        });
      }
    }
  }, [copied, querySelector]);

  return { copy, copied, setCopied };
}
