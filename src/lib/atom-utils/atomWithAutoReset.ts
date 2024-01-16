import { SetStateAction, atom } from "jotai";
import { atomWithDefault, RESET } from "jotai/utils";

const DEFAULT_RESET_DELAY = 1_000;

type SetAtom<Args extends unknown[], Result> = <A extends Args>(
  ...args: A
) => Result;
type Unsubscribe = (() => void) | void;
type AutoResetAtomOptions<Value> = Partial<{
  onMount: (
    setAtom: SetAtom<[typeof RESET | SetStateAction<Awaited<Value>>], void>,
  ) => Unsubscribe;
  resetDelay: number;
}>;

export function atomWithAutoReset<Value>(
  getDefault: Parameters<typeof atomWithDefault<Value>>[0],
  opts: AutoResetAtomOptions<Value> = {},
) {
  const triggerAtom = atom(false);
  const originAtom = atomWithDefault<Value>((get, opts) => {
    get(triggerAtom); // Rerender trigger for force update (FULL RESET case)
    return getDefault(get, opts);
  });

  const anAtom = atom(originAtom.read, (_get, set, update) => {
    set(originAtom, update);
    if (update === RESET) {
      set(triggerAtom, (v) => !v);
    }
  });

  let resetTimeout: ReturnType<typeof setTimeout> | null = null;
  let unsub: Unsubscribe;

  anAtom.onMount = (setAtom) => {
    if (resetTimeout === null) {
      unsub = opts?.onMount?.(setAtom as any);
    } else {
      clearTimeout(resetTimeout);
      resetTimeout = null;
    }

    return () => {
      resetTimeout = setTimeout(() => {
        resetTimeout = null;

        unsub?.();

        setAtom(RESET);
      }, opts?.resetDelay ?? DEFAULT_RESET_DELAY);
    };
  };

  return anAtom;
}
