import { RefObject, useCallback, useEffect, useState } from "react";

export function useCopyToClipboard<
  T extends HTMLInputElement | HTMLTextAreaElement
>(
  ref?: RefObject<T>,
  immediatelyBlur = false,
  copyDelay: number = 1000 * 2,
  copyCallback?: () => void
) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
        const textarea = ref?.current;
        if (textarea && document.activeElement === textarea) {
          textarea.blur();
        }
      }, copyDelay);

      return () => clearTimeout(timeout);
    }

    return;
  }, [ref, copied, setCopied, copyDelay]);

  const copy = useCallback(() => {
    if (copied) return;

    if (copyCallback) {
      setCopied(true);
      copyCallback();
      return;
    }

    const textarea = ref?.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      setCopied(true);
      if (immediatelyBlur && document.activeElement === textarea) {
        textarea.blur();
      }
    }
  }, [copied, ref, immediatelyBlur, copyCallback]);

  return { copy, copied, setCopied };
}
