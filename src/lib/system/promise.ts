export type Resolvable<R> = R | PromiseLike<R>;

export async function props<T>(rec: {
  [K in keyof T]: Resolvable<T[K]>;
}): Promise<{ [K in keyof T]: T[K] }> {
  return Object.fromEntries(
    await Promise.all(Object.entries(rec).map(async ([k, v]) => [k, await v])),
  );
}
