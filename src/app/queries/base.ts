import { useQueries, UseQueryOptions, UseQueryResult } from "react-query";

export function query<T extends UseQueryOptions>(opts: T) {
  return opts;
}

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export function useQueriesTyped<TQueries extends readonly UseQueryOptions[]>(
  queries: [...TQueries]
): {
  [ArrayElement in keyof TQueries]: UseQueryResult<
    TQueries[ArrayElement] extends { select: infer TSelect }
      ? TSelect extends (data: any) => any
        ? ReturnType<TSelect>
        : never
      : Awaited<
          ReturnType<
            NonNullable<
              Extract<TQueries[ArrayElement], UseQueryOptions>["queryFn"]
            >
          >
        >
  >;
} {
  return useQueries(
    queries as UseQueryOptions<unknown, unknown, unknown>[]
  ) as any;
}

export function useQueriesSuspense<TQueries extends readonly UseQueryOptions[]>(
  queries: [...TQueries]
): {
  [ArrayElement in keyof TQueries]: TQueries[ArrayElement] extends {
    select: infer TSelect;
  }
    ? TSelect extends (data: any) => any
      ? ReturnType<TSelect>
      : never
    : Awaited<
        ReturnType<
          NonNullable<
            Extract<TQueries[ArrayElement], UseQueryOptions>["queryFn"]
          >
        >
      >;
} {
  return useQueries(
    queries as UseQueryOptions<unknown, unknown, unknown>[]
  ).map(({ data }) => data) as any;
}
