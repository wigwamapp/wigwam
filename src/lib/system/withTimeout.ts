export function withTimeout<T>(ms: number, factory: () => Promise<T>) {
  return new Promise<T>((res, rej) => {
    let resolved = false;
    const resolve = (action: () => void) => {
      if (resolved) return;
      resolved = true;

      action();
    };

    const t = setTimeout(() => resolve(() => rej(new Error("Timeout"))), ms);

    factory()
      .then((value) => resolve(() => res(value)))
      .catch((err) => resolve(() => rej(err)))
      .finally(() => clearTimeout(t));
  });
}
