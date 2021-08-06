import { atom, SetStateAction } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import * as Storage from "lib/ext/storage";

export function atomWithGetStorage<T = any>(
  key: string,
  fallback: T | (() => T) | (() => Promise<T>)
) {
  const anAtom = atomWithDefault(async (): Promise<T> => {
    try {
      return await Storage.fetch<T>(key);
    } catch {
      return typeof fallback === "function" ? (fallback as any)() : fallback;
    }
  });

  anAtom.onMount = (setAtom) => {
    const unsub = Storage.subscribe<T>(key, ({ newValue }) => {
      if (typeof newValue === "undefined") {
        if (typeof fallback === "function") {
          const val = (fallback as any)();
          val instanceof Promise ? val.then(setAtom) : setAtom(val);
        } else {
          setAtom(fallback);
        }
      } else {
        setAtom(newValue);
      }
    });

    return () => {
      unsub();
      setAtom((v) => v);
      setAtom(RESET);
    };
  };

  return anAtom;
}

export function atomWithSetStorage<T>(key: string) {
  return atom(null, (_get, _set, update: SetStateAction<T>) => {
    (async () => {
      const newValue =
        typeof update === "function"
          ? (update as (prev?: T) => T)(await Storage.fetchForce<T>(key))
          : update;
      Storage.put(key, newValue);
    })();
  });
}
