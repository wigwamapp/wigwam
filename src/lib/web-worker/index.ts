import { ModuleThread, spawn, Thread } from "threads";
import memoizeOne from "memoize-one";

import { notifyWorkerSpawned } from "./hot-reload";

export type ModuleMethods = {
  [methodName: string]: (...args: any) => any;
};

export type CreateWorkerOptions = Partial<{
  terminateAfterIdle: boolean;
  idleDelay: number;
}>;

export function createWorker<T extends ModuleMethods>(
  workerFactory: () => Worker,
  opts: CreateWorkerOptions = {}
) {
  const terminateAfterIdle = opts.terminateAfterIdle !== false;
  const idleDelay = opts.idleDelay ?? 60_000; // 1 min

  let terminateTimeout: ReturnType<typeof setTimeout>;
  let queue = 0;

  const perform = async (
    factory: (worker: ModuleThread<T>) => Promise<any>
  ) => {
    if (terminateAfterIdle) {
      clearTimeout(terminateTimeout);
    }

    const worker = await spawnWorkerMemo();

    queue++;

    try {
      return await factory(worker);
    } finally {
      queue--;

      if (terminateAfterIdle && queue === 0) {
        terminateTimeout = setTimeout(terminate, idleDelay, worker);
      }
    }
  };

  const terminate = (thread: ModuleThread) => {
    spawnWorkerMemo.clear();
    Thread.terminate(thread).catch(console.error);
  };

  const spawnWorkerMemo = memoizeOne(() => {
    const worker = workerFactory();
    notifyWorkerSpawned(worker);
    return spawn(worker);
  });

  return {
    perform,
    terminate,
  };
}
