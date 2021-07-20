import { useCallback, useMemo } from "react";
import { navigate, useLocation, HistoryAction } from "woozie";

type SetValues<T> = React.Dispatch<React.SetStateAction<T[]>>;

export function useSearchParams<T = any>(
  key: string,
  action?: HistoryAction.Push | HistoryAction.Replace
): [T[], SetValues<T>] {
  const { search } = useLocation();

  const values = useMemo(
    () => toValues<T>(new URLSearchParams(search).getAll(key)),
    [search, key]
  );

  const setValues = useCallback<SetValues<T>>(
    (values) => {
      navigate((lctn) => {
        const usp = new URLSearchParams(lctn.search);
        if (typeof values === "function") {
          values = values(toValues<T>(usp.getAll(key)));
        }
        usp.delete(key);
        for (const value of values) {
          usp.append(key, JSON.stringify(value));
        }
        return { ...lctn, search: usp.toString() };
      }, action);
    },
    [key, action]
  );

  return [values, setValues];
}

function toValues<T = any>(entries: string[]) {
  const values: T[] = [];
  for (const entry of entries) {
    try {
      values.push(JSON.parse(entry) as T);
    } catch {}
  }
  return values;
}
