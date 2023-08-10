import { atom, SetStateAction } from "jotai";
import { RESET } from "jotai/utils";
import { StorageArea } from "lib/ext/storageArea";

import { atomWithAutoReset } from "./atomWithAutoReset";

export function createAtomWithStorageArea(storageArea: StorageArea) {
  return <T = any>(key: string, fallback: T | (() => T)) => {
    const getFallback = () =>
      typeof fallback === "function" ? (fallback as any)() : fallback;

    const fetchData = async (): Promise<T> => {
      try {
        return await storageArea.fetch<T>(key);
      } catch {
        return getFallback();
      }
    };

    const readAtom = atomWithAutoReset(fetchData, {
      onMount: (setAtom) =>
        storageArea.subscribe<T>(key, ({ newValue }) => {
          setAtom(typeof newValue !== "undefined" ? newValue : getFallback());
        }),
    });

    const storageAtom = atom(
      (get) => get(readAtom),
      async (get, _set, update: SetStateAction<T> | typeof RESET) => {
        try {
          if (update === RESET) {
            await storageArea.remove(key);
          } else {
            const newValue =
              typeof update === "function"
                ? (update as (prev: T) => T)(await get(storageAtom))
                : update;

            await storageArea.put(key, newValue);
          }
        } catch (err) {
          console.error(err);
        }
      },
    );

    return storageAtom;
  };
}
