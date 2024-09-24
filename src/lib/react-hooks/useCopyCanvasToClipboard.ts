import { useCallback, useEffect, useState } from "react";

import { useDialog } from "app/hooks/dialog";

export function useCopyCanvasToClipboard(
  querySelector: string,
  copyDelay: number = 1000 * 2,
) {
  const { alert } = useDialog();
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
    try {
      if (copied) return;

      const canvas = document.querySelector(querySelector) as
        | HTMLCanvasElement
        | undefined;

      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const blob: Blob | null = await new Promise((res) => {
            ctx.canvas.toBlob((blob) => res(blob));
          });

          if (blob) {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            setCopied(true);
          }
        }
      }
    } catch {
      alert({
        title: "Error while copying media",
        content: "Copy media doesn't work in this environment.",
      });
    }
  }, [alert, copied, querySelector]);

  return { copy, copied, setCopied };
}
