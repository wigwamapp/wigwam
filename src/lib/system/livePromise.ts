type Unsubscribe = (() => void) | void;

/**
 * For optimization and improved performance,
 * This will be beneficial in cases where you don't want an asynchronous function,
 * such as "storage.get," to be called every time. Additionally, there is an option
 * to subscribe and always be aware of the latest value.
 * In this way, the function will request the value the first time and
 * will consistently return that value until a new one appears through subscription.
 *
 * The `livePromise` is a factory that creates async function that resolves with the latest value
 * from a provided asynchronous sources, and allows for subscribing to updates and
 * clearing the subscription.
 * @param pick - The `pick` parameter is a function that returns a promise that
 * resolves to a value of type `T` or `undefined`. This function is responsible for
 * retrieving the initial value or any subsequent updates to the value.
 * @param subscribe - The `subscribe` parameter is a function that takes a callback
 * function as an argument. This callback function will be called whenever there is
 * a new value available. The `subscribe` function should return an `Unsubscribe`
 * function, which can be called to unsubscribe from further updates.
 * @returns Async function.
 */
export function livePromise<T>(
  pick: () => Promise<T | undefined>,
  subscribe: (callback: (newValue: T) => void) => Unsubscribe,
) {
  let promise: Promise<T> | undefined;
  let unsub: Unsubscribe;

  const factory = () => {
    if (!promise) {
      promise = new Promise<T>((res) => {
        let resolved = false;

        pick()
          .then((value) => {
            if (!resolved && value !== undefined) {
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
