/**
 * The `createQueue` function returns a function that creates a queue of promises
 * and executes them in order.
 * @returns The `createQueue` function returns a function that takes a `factory`
 * function as an argument and returns a `Promise` that resolves to the result of
 * calling the `factory` function.
 */
export function createQueue() {
  let worker: Promise<any> = Promise.resolve();

  return <T>(factory: () => Promise<T>): Promise<T> =>
    new Promise((res, rej) => {
      worker = worker.then(() => factory().then(res).catch(rej));
    });
}
