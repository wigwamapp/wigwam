import { useState, Dispatch, SetStateAction, useCallback } from "react";

import { useIsMounted } from "./useIsMounted";

export function useSafeState<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>];
export function useSafeState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
];
export function useSafeState(initialState?: any) {
  const [state, setState] = useState(initialState);
  const isMounted = useIsMounted();

  const setStateSafe = useCallback<typeof setState>(
    (value) => {
      if (!isMounted()) return;
      return setState(value);
    },
    [isMounted, setState],
  );

  return [state, setStateSafe];
}
