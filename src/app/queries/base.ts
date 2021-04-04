import { UseQueryOptions, QueryKey } from "react-query";

export function query<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  opts: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    queryKey: TQueryKey;
  }
) {
  return opts;
}
