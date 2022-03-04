import { createWorker } from "lib/web-worker";

import { RpcResponse } from "core/types";
import { getRpcUrl } from "core/common/network";

import type * as Provider from "./provider";

const { perform } = createWorker<typeof Provider>(
  () => new Worker(new URL("./worker", import.meta.url)),
  {
    idleDelay: 5 * 60 * 60_000, // 5 min
  }
);

export async function sendRpc(
  chainId: number,
  method: string,
  params: any[]
): Promise<RpcResponse> {
  const rpcUrl = await getRpcUrl(chainId);

  return perform((worker) => worker.sendRpc(chainId, rpcUrl, method, params));
}
