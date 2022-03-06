import { useRef, useEffect } from "react";
import { Atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";

export enum KeepPrevious {
  WhenNotUndefined,
  Always,
  Off,
}

export function useLazyAtomValue<T>(
  atom: Atom<T>,
  previousMode = KeepPrevious.WhenNotUndefined
) {
  const value = useAtomValue(loadable(atom));

  const data = value.state === "hasData" ? value.data : undefined;

  const prevDataRef = useRef<typeof data>();
  useEffect(() => {
    if (previousMode !== KeepPrevious.Off) {
      if (previousMode === KeepPrevious.Always || data !== undefined) {
        prevDataRef.current = data;
      }
    }
  }, [previousMode, data]);

  return data ?? prevDataRef.current;
}
