import { useCallback, useEffect, useState } from "react";

import { useDialog } from "app/hooks/dialog";

export function usePasteFromClipboard(
  setValue?: (value: string) => void,
  copyDelay: number = 1000 * 2,
) {
  const { alert } = useDialog();
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
    try {
      if (pasted) return;

      const text = await navigator.clipboard.readText();
      if (setValue) {
        setValue(text);
      }
      setPasted(true);
    } catch {
      alert({
        title: "Error while pasting value",
        content: "Paste functionality doesn't work in this environment.",
      });
    }
  }, [alert, pasted, setValue]);

  return { paste, pasted, setPasted };
}
