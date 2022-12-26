import { atom, SetStateAction } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import * as ClientStorage from "lib/ext/clientStorage";

export function atomWithClientStorage(
  key: string,
  fallback: string | (() => string)
) {
  const getData = (): string =>
    ClientStorage.get(key) ??
    (typeof fallback === "function" ? (fallback as any)() : fallback);

  const baseAtom = atomWithDefault(getData);

  baseAtom.onMount = (setAtom) => {
    const unsub = ClientStorage.subscribe(key, () => setAtom(getData()));
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
      ClientStorage.put(key, newValue);
    }
  );

  return anAtom;
}
