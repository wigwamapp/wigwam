import { resource } from "lib/resax";
import * as Storage from "lib/ext/storage";

export type StorageResourceOptions<T> = Partial<{
  fallback?: T | (() => Promise<T>);
  preload: boolean;
}>;

export function storageResource<T = any>(
  key: string,
  opts: StorageResourceOptions<T> = {}
) {
  return resource(
    async () =>
      Storage.fetchForce<T>(key).then((val) =>
        val !== undefined ? val : (opts.fallback as T)
      ),
    {
      preload: opts.preload,
      onMount: (r) =>
        Storage.subscribe<T>(key, ({ newValue }) => {
          r.put(newValue!);
        }),
    }
  );
}
