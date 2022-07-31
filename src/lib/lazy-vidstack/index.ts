import { ComponentType, lazy } from "react";
import memoizeOne from "memoize-one";

const importVidstack = memoizeOne(() => import("@vidstack/player-react"));

export function lazyVidstack<T extends ComponentType<any>>(
  factory: (m: Awaited<ReturnType<typeof importVidstack>>) => T
) {
  return lazy(() => importVidstack().then((m) => ({ default: factory(m) })));
}
