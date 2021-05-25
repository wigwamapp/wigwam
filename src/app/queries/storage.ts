import { useEffect, useMemo } from "react";
import { useQueryClient } from "react-query";
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
        queryClient.setQueryData(storageQuery.queryKey, newValue);
      }),
    [queryClient, key, storageQuery.queryKey]
  );

  return storageQuery;
}
