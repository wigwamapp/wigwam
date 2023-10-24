import { ethers } from "ethers";
import memoizeOne from "memoize-one";
import memoize from "mem";

import { RpcResponse } from "core/types";
import { getRpcUrl } from "core/common/network";

import * as Provider from "./provider";

export async function sendRpc(
  chainId: number,
  method: string,
  params: any[],
): Promise<RpcResponse> {
  const rpcUrl = await getRpcUrl(chainId);

  return Provider.sendRpc(chainId, rpcUrl, method, params);
}

export const getRpcProvider = memoize(
  (chainId: number) => new RpcProvider(chainId),
);

export class RpcProvider extends ethers.JsonRpcApiProvider {
  constructor(public chainId: number) {
    super(chainId, { staticNetwork: ethers.Network.from(chainId) });
  }

  getNetwork = memoizeOne(super.getNetwork.bind(this));

  async send(method: string, params: Array<any>): Promise<any> {
    const res = await sendRpc(this.chainId, method, params);

    return getResult(res);
  }

  async _send(
    payload: ethers.JsonRpcPayload | Array<ethers.JsonRpcPayload>,
  ): Promise<Array<ethers.JsonRpcResult>> {
    const payloadArr = Array.isArray(payload) ? payload : [payload];

    const responses = await Promise.all(
      payloadArr.map(async ({ jsonrpc, id, method, params }) => {
        // TODO: Check JSONRPC params types
        const res = await sendRpc(this.chainId, method, params as any);

        return { jsonrpc, id, ...res };
      }),
    );

    return responses as any;
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
