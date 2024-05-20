import { useCallback, useEffect, useState } from "react";

export function useCopyToClipboard(
  textPredefined?: string | number | readonly string[],
  copyDelay: number = 1000 * 2,
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

  const copy = useCallback(
    async (
      text: string | number | readonly string[] = textPredefined ?? "",
    ) => {
      if (copied || !text) return;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text.toString());
      } else {
        const textArea = document.createElement("textarea");
        textArea.innerText = text.toString();
        const wrapper =
          document.querySelector('[role="dialog"]') ?? document.body;
        wrapper.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
    },
    [copied, textPredefined],
  );

  return { copy, copied, setCopied };
}
