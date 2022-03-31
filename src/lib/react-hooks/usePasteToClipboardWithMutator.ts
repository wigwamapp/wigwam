import { useCallback, useEffect, useState } from "react";

export function usePasteToClipboardWithMutator(
  mutator?: (value: string) => void,
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
    const value = await navigator.clipboard.readText();
    if (mutator) {
      mutator(value);
    }
    setPasted(true);
  }, [pasted, mutator]);

  return { paste, pasted, setPasted };
}
