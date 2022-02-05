import { atom, SetStateAction } from "jotai";
import { RESET } from "jotai/utils";
import { storage } from "lib/ext/storage";

import { atomWithAutoReset } from "./atomWithAutoReset";

export function atomWithStorage<T = any>(key: string, fallback: T | (() => T)) {
  const getFallback = () =>
    typeof fallback === "function" ? (fallback as any)() : fallback;

  const fetchData = async (): Promise<T> => {
    try {
      return await storage.fetch<T>(key);
    } catch {
      return getFallback();
    }
  };

  const readAtom = atomWithAutoReset(fetchData, {
    onMount: (setAtom) =>
      storage.subscribe<T>(key, ({ newValue }) => {
        setAtom(typeof newValue !== "undefined" ? newValue : getFallback());
      }),
  });

  const storageAtom = atom(
    (get) => get(readAtom),
    (get, _set, update: SetStateAction<T> | typeof RESET) => {
      if (update === RESET) {
        storage.remove(key).catch(console.error);
      } else {
        const newValue =
          typeof update === "function"
            ? (update as (prev: T) => T)(get(storageAtom))
            : update;

        storage.put(key, newValue).catch(console.error);
      }
    }
  );

  return storageAtom;
}
