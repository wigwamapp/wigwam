import { atom, SetStateAction } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";
import { listen, changeState } from "lib/history";
import {
  serialize,
  deserialize,
  getHashSearchParams,
  toURL,
} from "lib/navigation";

export function atomWithURLHash<T>(key: string, initialValue: T) {
  const getValue = (params: URLSearchParams) => {
    const value = params.get(key);
    return value !== null ? deserialize<T>(value) : initialValue;
  };

  const baseAtom = atomWithDefault(() => getValue(getHashSearchParams()));

  baseAtom.onMount = (setAtom) => {
    const unsub = listen(() => setAtom(getValue(getHashSearchParams())));

    return () => {
      setAtom((v) => v);
      setAtom(RESET);
      unsub();
    };
  };

  const anAtom = atom(
    (get) => get(baseAtom),
    (
      _get,
      _set,
      [update, action]: [SetStateAction<T>] | [SetStateAction<T>, "replace"]
    ) => {
      const searchParams = getHashSearchParams();
      const newValue =
        typeof update === "function"
          ? (update as (prev: T) => T)(getValue(searchParams))
          : update;

      searchParams.set(key, serialize(newValue));
      const hash = searchParams.toString();

      changeState(toURL(hash), action === "replace");
    }
  );

  return anAtom;
}
