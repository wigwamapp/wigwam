import { useEffect, useMemo } from "react";
import { useQueryClient } from "react-query";
import * as Storage from "lib/ext/storage";

export function useStorageQuery<T = any>(key: string) {
  const queryClient = useQueryClient();

  const storageQuery = useMemo(
    () => ({
      queryKey: ["storage", key],
      queryFn: () => Storage.fetchForce<T>(key),
      refetchOnReconnect: false,
      staleTime: Infinity,
    }),
    [key]
  );

  useEffect(
    () =>
      Storage.subscribe<T>(key, ({ newValue }) => {
        queryClient.setQueryData(storageQuery.queryKey, newValue);
      }),
    [queryClient, key, storageQuery.queryKey]
  );

  return storageQuery;
}
