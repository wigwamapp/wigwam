import { Atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { usePrevious, KeepPrevious } from "lib/react-hooks/usePrevious";

export function useLazyAtomValue<T>(
  atom: Atom<T>,
  previousMode: KeepPrevious = "when-not-undefined",
) {
  const value = useAtomValue(loadable(atom));

  const data = value.state === "hasData" ? value.data : undefined;
  const prevData = usePrevious(data, previousMode);

  return data ?? prevData;
}
