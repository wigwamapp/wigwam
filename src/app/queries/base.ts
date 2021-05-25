import { UseQueryOptions } from "react-query";

export function query<T extends UseQueryOptions>(opts: T) {
  return opts;
}
