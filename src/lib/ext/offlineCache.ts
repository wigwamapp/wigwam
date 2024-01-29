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
      const keyStr = typeof key === "function" ? key(args) : key;

      try {
        const cached = await globalStorage.fetchForce<{
          data: T;
          addedAt: number;
        }>(keyStr);

        if (cached && cached.addedAt > Date.now() - coldMaxAge) {
          return cached.data;
        }
      } catch (err) {
        console.error(err);
      }

      const data = await factory(...args);
      if (data) await globalStorage.put(keyStr, { data, addedAt: Date.now() });

      return data;
    },
    {
      maxAge: hotMaxAge,
      cacheKey: typeof key === "function" ? key : undefined,
    },
  );
}
