import { Atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

export function useLazyAtomValue<T>(atom: Atom<T>, previous = true) {
  const value = useAtomValue(loadable(atom));

  const data = value.state === "hasData" ? value.data : undefined;
  const prevData = usePrevious(previous ? data : undefined);

  return data ?? prevData;
}
