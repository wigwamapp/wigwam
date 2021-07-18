import { useEffect, useMemo } from "react";
import { useQueryClient } from "react-query";
import { dequal } from "dequal/lite";

import * as Storage from "lib/ext/storage";

import { query } from "./base";

export function useStorageQuery<T = any>(
  key: string,
  fallback?: T | (() => Promise<T>)
) {
  const queryClient = useQueryClient();

  const storageQuery = useMemo(
    () =>
      query({
        queryKey: ["storage", key],
        queryFn: () =>
          Storage.fetchForce<T>(key).then((val) =>
            val !== undefined ? val : (fallback as T)
          ),
        refetchOnReconnect: false,
        staleTime: Infinity,
      }),
    [key, fallback]
  );

  useEffect(
    () =>
      Storage.subscribe<T>(key, ({ newValue }) => {
        // Avoid re-updates
        const currentValue = queryClient.getQueryData(storageQuery.queryKey);
        if (!dequal(newValue, currentValue)) {
          queryClient.setQueryData(storageQuery.queryKey, newValue);
        }
      }),
    [queryClient, key, storageQuery.queryKey]
  );

  return storageQuery;
}
