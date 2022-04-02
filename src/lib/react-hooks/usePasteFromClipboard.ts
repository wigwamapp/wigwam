import { useCallback, useEffect, useState } from "react";

export function usePasteFromClipboard(
  setValue: (value: string) => void,
  copyDelay: number = 1000 * 2
) {
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    if (pasted) {
      const timeout = setTimeout(() => {
        setPasted(false);
      }, copyDelay);

      return () => clearTimeout(timeout);
    }

    return;
  }, [copyDelay, pasted]);

  const paste = useCallback(async () => {
    if (pasted) return;

    const text = await navigator.clipboard.readText();
    setValue(text);
    setPasted(true);
  }, [pasted, setValue]);

  return { paste, pasted, setPasted };
}
