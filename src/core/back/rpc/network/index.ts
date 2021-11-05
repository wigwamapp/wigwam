import { ModuleThread, spawn, Thread } from "threads";
import memoizeOne from "memoize-one";
import { assert } from "lib/system/assert";
import { notifyWorkerSpawned } from "lib/ext/worker";

import * as Repo from "core/repo";

import type * as Provider from "./provider";

const RPC_WORKER_TERMINATE_TIMEOUT = 5 * 60 * 60_000; // 5 min

export async function sendRpc(chainId: number, method: string, params: any[]) {
  const worker = await getWorker();
  const network = await getNetwork(chainId);

  const url = network.rpcUrls[0];
  const result = await worker.sendRpc(chainId, url, method, params);

  return result;
}

const getNetwork = memoizeOne(async (chainId: number) => {
  const network = await Repo.networks.get(chainId);
  assert(network);

  return network;
});

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
