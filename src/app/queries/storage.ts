import { useEffect, useMemo } from "react";
import { useQueryClient } from "react-query";
import { dequal } from "dequal/lite";

import * as Storage from "lib/ext/storage";

import { query } from "./base";

export function useStorageQuery<T = any>(key: string) {
  const queryClient = useQueryClient();

  const storageQuery = useMemo(
    () =>
      query({
        queryKey: ["storage", key],
        queryFn: () => Storage.fetchForce<T>(key),
        refetchOnReconnect: false,
        staleTime: Infinity,
        refetchOnMount: true,
      }),
    [key]
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
