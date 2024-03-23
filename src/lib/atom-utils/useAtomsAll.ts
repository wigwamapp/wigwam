import { Atom, atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";

type ResolveAtom<T> = T extends Atom<infer V> ? V : T;
type AwaitedAtom<T> = Awaited<ResolveAtom<T>>;

const getAtomsAll = atomFamily(
  (atoms: Atom<unknown>[]) =>
    atom((get) => {
      const values = atoms.map((a) => get(a));

      return Promise.all(values);
    }),
  isAtomsEqual,
);

export function useAtomsAll<Atoms extends Atom<unknown>[]>(
  atoms: [...Atoms],
  delay = 30,
): {
  [K in keyof Atoms]: AwaitedAtom<Atoms[K]>;
} {
  const anAtom = getAtomsAll(atoms);

  return useAtomValue(anAtom, { delay }) as any;
}

function isAtomsEqual(a: Atom<unknown>[], b: Atom<unknown>[]) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
