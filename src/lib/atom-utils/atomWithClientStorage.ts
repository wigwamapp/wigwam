import { atom, SetStateAction } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import * as ClientStorage from "lib/ext/clientStorage";

export function atomWithClientStorage<T extends string>(
  key: string,
  fallback: T | (() => T),
) {
  const getData = (): T =>
    ClientStorage.get(key) ??
    (typeof fallback === "function" ? (fallback as any)() : fallback);

  const baseAtom = atomWithDefault(getData);

  baseAtom.onMount = (setAtom) => {
    const unsub = ClientStorage.subscribe(key, () =>
      setAtom(getData() as Awaited<T>),
    );
    return () => {
      unsub();
      setAtom((v) => v);
      setAtom(RESET);
    };
  };

  const anAtom = atom(
    (get) => get(baseAtom),
    (get, _set, update: SetStateAction<T>) => {
      const newValue =
        typeof update === "function"
          ? (update as (prev: T) => T)(get(baseAtom))
          : update;
      ClientStorage.put(key, newValue);
    },
  );

  return anAtom;
}
