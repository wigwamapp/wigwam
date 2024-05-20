import { atom, WritableAtom } from "jotai";
import { RESET } from "jotai/utils";
import { listen, changeState } from "lib/history";
import {
  serialize,
  deserialize,
  getHashSearchParams,
  toURL,
} from "lib/navigation";

import { atomWithAutoReset } from "./atomWithAutoReset";

type Update<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

export type URLHashAtom<T> = WritableAtom<
  T,
  [[Update<T>] | [Update<T>, "replace"]],
  void
>;

export function atomWithURLHash<T>(
  key: string,
  initialValue: T,
): URLHashAtom<T> {
  const getValue = (params: URLSearchParams) => {
    const value = params.get(key);
    return value !== null ? deserialize<T>(value) : initialValue;
  };

  const readAtom = atomWithAutoReset(() => getValue(getHashSearchParams()), {
    onMount: (setAtom) =>
      listen(() => setAtom(getValue(getHashSearchParams()) as Awaited<T>)),
  });

  const urlHashAtom = atom(
    (get) => get(readAtom),
    (_get, _set, [update, action]: [Update<T>] | [Update<T>, "replace"]) => {
      const searchParams = getHashSearchParams();
      const newValue =
        typeof update === "function"
          ? (update as (prev: T) => T)(getValue(searchParams))
          : update;

      if (newValue === RESET) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, serialize(newValue));
      }

      changeState(toURL(searchParams.toString()), action === "replace");
    },
  );

  return urlHashAtom;
}
