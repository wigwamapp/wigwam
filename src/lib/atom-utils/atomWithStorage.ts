import { atom, SetStateAction } from "jotai";
import { storage } from "lib/ext/storage";

export function atomWithStorage<T = any>(
  key: string,
  fallback: T | (() => T) | (() => Promise<T>)
) {
  const fetchData = async (): Promise<T> => {
    try {
      return await storage.fetch<T>(key);
    } catch {
      return typeof fallback === "function" ? (fallback as any)() : fallback;
    }
  };

  const storageResutAtom = atom(() => {
    const initialPromise = fetchData();
    const dataAtom = atom<T | Promise<T>>(initialPromise);

    let alreadyMounted = false;

    dataAtom.onMount = (setAtom) => {
      if (alreadyMounted) {
        fetchData()
          .then(setAtom)
          .catch((err) => setAtom(Promise.reject(err)));
      }

      alreadyMounted = true;

      return storage.subscribe<T>(key, ({ newValue }) => {
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
    };

    return dataAtom;
  });

  const storageAtom = atom(
    (get) => get(get(storageResutAtom)),
    (get, _set, update: SetStateAction<T>) => {
      const newValue =
        typeof update === "function"
          ? (update as (prev: T) => T)(get(storageAtom))
          : update;
      storage.put(key, newValue);
    }
  );

  return storageAtom;
}
