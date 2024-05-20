import { Atom, Getter } from "jotai";
import { liveQuery, Observable } from "dexie";
import { atomWithObservable } from "jotai/utils";

export function atomWithRepoQuery<TData>(
  factory: (query: typeof liveQuery, get: Getter) => Observable<TData>,
): Atom<TData | Promise<TData>> {
  return atomWithObservable((get) => factory(liveQuery, get));
}
