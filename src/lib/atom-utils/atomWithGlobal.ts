import { atom, SetStateAction } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import * as Global from "lib/ext/global";

export function atomWithGlobal(key: string, fallback: string | (() => string)) {
  const getData = (): string =>
    Global.get(key) ??
    (typeof fallback === "function" ? (fallback as any)() : fallback);

  const baseAtom = atomWithDefault(getData);

  baseAtom.onMount = (setAtom) => {
    const unsub = Global.subscribe(key, () => setAtom(getData()));
    return () => {
      unsub();
      setAtom((v) => v);
      setAtom(RESET);
    };
  };

  const anAtom = atom(
    (get) => get(baseAtom),
    (get, _set, update: SetStateAction<string>) => {
      const newValue =
        typeof update === "function"
          ? (update as (prev: string) => string)(get(baseAtom))
          : update;
      Global.put(key, newValue);
    }
  );

  return anAtom;
}
