import { Atom, SetStateAction, atom } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";

type SetAtom<
  Update,
  Result extends void | Promise<void>
> = undefined extends Update
  ? (update?: Update) => Result
  : (update: Update) => Result;

type Unsubscribe = (() => void) | void;

type AutoResetAtomOptions<T> = Partial<{
  onMount: (
    setAtom: SetAtom<typeof RESET | SetStateAction<T>, void>
  ) => Unsubscribe;
  resetDelay: number;
}>;

const DEFAULT_RESET_DELAY = 1_000;

export function atomWithAutoReset<T>(
  getDefault: Atom<T | Promise<T>>["read"],
  opts?: AutoResetAtomOptions<T>
): Atom<T> {
  const factoryAtom = atom(() => {
    const originAtom = atomWithDefault(getDefault);

    let resetTimeout: ReturnType<typeof setTimeout> | null = null;
    let unsub: Unsubscribe;

    originAtom.onMount = (setAtom) => {
      if (resetTimeout === null) {
        unsub = opts?.onMount?.(setAtom);
      } else {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }

      return () => {
        resetTimeout = setTimeout(() => {
          resetTimeout = null;

          unsub?.();

          setAtom((v) => v);
          setAtom(RESET);
        }, opts?.resetDelay ?? DEFAULT_RESET_DELAY);
      };
    };

    return originAtom;
  });

  const anAtom = atom((get) => get(get(factoryAtom)));

  return anAtom;
}
