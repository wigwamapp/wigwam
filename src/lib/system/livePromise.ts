export function livePromise<T>(
  pick: () => Promise<T | undefined>,
  subscribe: (callback: (newValue: T) => void) => any
) {
  let promise: Promise<T> | undefined;

  return () => {
    if (!promise) {
      promise = new Promise<T>((res) => {
        let resolved = false;

        pick()
          .then((value) => {
            if (value) {
              res(value);
              resolved = true;
            }
          })
          .catch(console.error);

        subscribe((value) => {
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
}
