import { atom, SetStateAction } from "jotai";
import { listen, changeState } from "lib/history";
import {
  serialize,
  deserialize,
  getHashSearchParams,
  toURL,
} from "lib/navigation";

import { atomWithAutoReset } from "./atomWithAutoReset";

export function atomWithURLHash<T>(key: string, initialValue: T) {
  const getValue = (params: URLSearchParams) => {
    const value = params.get(key);
    return value !== null ? deserialize<T>(value) : initialValue;
  };

  const readAtom = atomWithAutoReset(() => getValue(getHashSearchParams()), {
    onMount: (setAtom) =>
      listen(() => setAtom(getValue(getHashSearchParams()))),
  });

  const urlHashAtom = atom(
    (get) => get(readAtom),
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

  return urlHashAtom;
}
