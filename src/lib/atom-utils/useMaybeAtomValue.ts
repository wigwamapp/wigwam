import { atom, Atom } from "jotai";
import { useAtomValue } from "jotai/utils";

const nilAtom = atom(null);

export function useMaybeAtomValue<T>(
  anAtom: Atom<T> | null | false | undefined
) {
  return useAtomValue(anAtom || nilAtom);
}
