import { Atom } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";

export function atomWithAutoReset<T = any>(getDefault: Atom<T>["read"]) {
  const anAtom = atomWithDefault(getDefault);

  anAtom.onMount = (setAtom) => () => {
    setAtom((v) => v);
    setAtom(RESET);
  };

  return anAtom;
}
