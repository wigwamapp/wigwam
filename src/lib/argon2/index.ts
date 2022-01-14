import { ModuleThread, spawn, Thread } from "threads";
import memoizeOne from "memoize-one";
import { notifyWorkerSpawned } from "lib/ext/worker";

import type * as Argon2 from "argon2-browser";

const ARGON2_WORKER_TERMINATE_TIMEOUT = 60_000; // 1 min

export const hash: typeof Argon2["hash"] = (params) =>
  withWorker((w) => w.hash(params));

export const verify: typeof Argon2["verify"] = (params) =>
  withWorker((w) => w.verify(params));

let terminateTimeout: number;
const withWorker = async (
  factory: (
    worker: ModuleThread<Omit<typeof Argon2, "ArgonType">>
  ) => Promise<any>
) => {
  clearTimeout(terminateTimeout);

  const worker = await spawnWorkerMemo();

  try {
    return await factory(worker);
  } finally {
    terminateTimeout = setTimeout(
      terminate,
      ARGON2_WORKER_TERMINATE_TIMEOUT,
      worker
    );
  }
};

const spawnWorkerMemo = memoizeOne(() => {
  const worker = new Worker(new URL("./worker", import.meta.url));
  notifyWorkerSpawned(worker);
  return spawn<Omit<typeof Argon2, "ArgonType">>(worker);
});

const terminate = (thread: ModuleThread) => {
  spawnWorkerMemo.clear();
  Thread.terminate(thread).catch(console.error);
};
