import { useState, useEffect, useCallback } from "react";

export function useDocumentVisibility() {
  const [isHidden, setHidden] = useState(document.hidden);

  const handleVisibilityChange = useCallback(() => {
    setHidden(document.hidden);
  }, [setHidden]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isHidden;
}
