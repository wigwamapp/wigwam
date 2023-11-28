import memoize from "mem";

import { globalStorage } from "./globalStorage";

export function withOfflineCache<T>(
  factory: () => Promise<T>,
  {
    key,
    hotMaxAge,
    coldMaxAge,
  }: {
    key: string;
    hotMaxAge: number;
    coldMaxAge: number;
  },
): () => Promise<T> {
  return memoize(
    async () => {
      try {
        const cached = await globalStorage.fetchForce<{
          data: T;
          addedAt: number;
        }>(key);

        if (cached && cached.addedAt > Date.now() - coldMaxAge) {
          return cached.data;
        }
      } catch (err) {
        console.error(err);
      }

      const data = await factory();
      if (data) await globalStorage.put(key, { data, addedAt: Date.now() });

      return data;
    },
    { maxAge: hotMaxAge },
  );
}
