import memoize from "mem";

import { globalStorage } from "./globalStorage";

export function withOfflineCache<T, U extends any[]>(
  factory: (...args: U) => Promise<T>,
  {
    key,
    hotMaxAge,
    coldMaxAge,
  }: {
    key: string | ((args: U) => string);
    hotMaxAge: number;
    coldMaxAge: number;
  },
): (...args: U) => Promise<T> {
  return memoize(
    async (...args: U) => {
      const keyStr = `cache_${typeof key === "function" ? key(args) : key}`;
      const bid = process.env.BUILD_ID;

      try {
        const cached = await globalStorage.fetchForce<{
          data: T;
          addedAt: number;
          bid: string;
        }>(keyStr);

        if (
          cached &&
          cached.bid === bid &&
          cached.addedAt > Date.now() - coldMaxAge
        ) {
          return cached.data;
        }
      } catch (err) {
        console.error(err);
      }

      const data = await factory(...args);
      if (data)
        await globalStorage.put(keyStr, { data, addedAt: Date.now(), bid });

      return data;
    },
    {
      maxAge: hotMaxAge,
      cacheKey: typeof key === "function" ? key : undefined,
    },
  );
}
