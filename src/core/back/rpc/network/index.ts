import { ModuleThread, spawn, Thread } from "threads";
import memoizeOne from "memoize-one";
import { notifyWorkerSpawned } from "lib/ext/worker";

import { getRpcUrl } from "core/common/network";

import type * as Provider from "./provider";

const RPC_WORKER_TERMINATE_TIMEOUT = 5 * 60 * 60_000; // 5 min

export async function sendRpc(chainId: number, method: string, params: any[]) {
  const [worker, url] = await Promise.all([getWorker(), getRpcUrl(chainId)]);

  try {
    return await worker.sendRpc(chainId, url, method, params);
  } catch (err) {
    // @TODO: Handle non rpc errors, and wrap them to rpc format
    throw err;
  }
}

let terminateTimeout: number;
const getWorker = async () => {
  clearTimeout(terminateTimeout);
  const worker = await spawnWorkerMemo();
  terminateTimeout = setTimeout(
    terminate,
    RPC_WORKER_TERMINATE_TIMEOUT,
    worker
  );

  return worker;
};

const spawnWorkerMemo = memoizeOne(() => {
  const worker = new Worker(new URL("./worker", import.meta.url));
  notifyWorkerSpawned(worker);
  return spawn<typeof Provider>(worker);
});

const terminate = (thread: ModuleThread) => {
  spawnWorkerMemo.clear();
  Thread.terminate(thread).catch(console.error);
};
