import { atom, useAtomValue, Atom } from "jotai";

const nilAtom = atom(null);

export function useMaybeAtomValue<T>(
  anAtom: Atom<T> | null | false | undefined,
) {
  return useAtomValue(anAtom || nilAtom);
}
