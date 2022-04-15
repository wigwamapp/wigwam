import { RefObject, useCallback, useEffect, useState } from "react";

export function useCopyToClipboard<
  T extends HTMLInputElement | HTMLTextAreaElement | HTMLSpanElement
>(ref: RefObject<T>, copyDelay: number = 1000 * 2) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
        const textarea = ref.current;
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

    const textarea = ref.current;
    if (textarea) {
      if (isInput(textarea)) {
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        setCopied(true);
      } else {
        // if ref isn't input (e.g. span)
        navigator.clipboard.writeText(textarea.innerText);
      }
      setCopied(true);
    }
  }, [ref, copied, setCopied]);

  return { copy, copied, setCopied };
}

function isInput(elem: any): elem is HTMLInputElement | HTMLTextAreaElement {
  return elem.select ? true : false;
}
