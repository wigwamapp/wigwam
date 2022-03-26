import { RefObject, useCallback, useEffect, useState } from "react";

export function usePasteToClipboard<
  T extends HTMLInputElement | HTMLTextAreaElement
>(ref: RefObject<T>, copyDelay: number = 1000 * 2) {
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    if (pasted) {
      const timeout = setTimeout(() => {
        setPasted(false);
      }, copyDelay);

      return () => clearTimeout(timeout);
    }

    return;
  }, [ref, copyDelay, pasted]);

  const paste = useCallback(async () => {
    if (pasted) return;

    const textarea = ref.current;
    if (textarea) {
      const text = await navigator.clipboard.readText();
      textarea.select();
      textarea.value = text;
      setPasted(true);
    }
  }, [pasted, ref]);

  return { paste, pasted, setPasted };
}
