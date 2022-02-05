type Unsubscribe = (() => void) | void;

export function livePromise<T>(
  pick: () => Promise<T | undefined>,
  subscribe: (callback: (newValue: T) => void) => Unsubscribe
) {
  let promise: Promise<T> | undefined;
  let unsub: Unsubscribe;

  const factory = () => {
    if (!promise) {
      promise = new Promise<T>((res) => {
        let resolved = false;

        pick()
          .then((value) => {
            if (!resolved && value) {
              res(value);
              resolved = true;
            }
          })
          .catch(console.error);

        unsub = subscribe((value) => {
          promise = Promise.resolve(value);

          if (!resolved) {
            res(value);
            resolved = true;
          }
        });
      });
    }

    return promise;
  };

  factory.clear = () => {
    unsub?.();
  };

  return factory;
}
