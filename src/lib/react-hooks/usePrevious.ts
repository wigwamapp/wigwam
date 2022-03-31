import { useRef, useEffect } from "react";

export type KeepPrevious = "off" | "always" | "when-not-undefined";

export function usePrevious<T>(value: T, mode: KeepPrevious = "always") {
  const ref = useRef<T>();

  useEffect(() => {
    if (mode !== "off" && (mode === "always" || value !== undefined)) {
      ref.current = value;
    }
  }, [mode, value]);

  return ref.current;
}
