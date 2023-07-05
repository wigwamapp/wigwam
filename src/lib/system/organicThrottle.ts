// Organic Throttle
// The difference from the plain throttle is the lack of delay.
// It simply doesn't allow the original function to be executed in parallel.
export function createOrganicThrottle() {
  let worker: Promise<unknown> | null = null;

  return <T>(factory: () => Promise<T>) => {
    if (!worker) {
      worker = factory().finally(() => {
        worker = null;
      });
    }

    return worker as Promise<T>;
  };
}
