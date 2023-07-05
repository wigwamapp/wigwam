import { JsonRpcProvider } from "@ethersproject/providers";
import memoizeOne from "memoize-one";
import memoize from "mem";

import { RpcResponse } from "core/types";
import { getRpcUrl } from "core/common/network";

import * as Provider from "./provider";

export async function sendRpc(
  chainId: number,
  method: string,
  params: any[]
): Promise<RpcResponse> {
  const rpcUrl = await getRpcUrl(chainId);

  return Provider.sendRpc(chainId, rpcUrl, method, params);
}

export const getRpcProvider = memoize(
  (chainId: number) => new RpcProvider(chainId)
);

export class RpcProvider extends JsonRpcProvider {
  constructor(chainId: number) {
    super("", chainId);
  }

  getNetwork = memoizeOne(super.getNetwork.bind(this));

  getSigner = memoize(super.getSigner.bind(this));

  async send(method: string, params: Array<any>): Promise<any> {
    const res = await sendRpc(this.network.chainId, method, params);

    return getResult(res);
  }
}

function getResult(response: RpcResponse): any {
  if ("error" in response) {
    const error = new Error(response.error.message);
    (error as any).code = response.error.code;
    (error as any).data = response.error.data;

    throw error;
  }

  return response.result;
}
