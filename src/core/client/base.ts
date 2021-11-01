import { JsonRpcProvider } from "@ethersproject/providers";
import memoizeOne from "memoize-one";
import { PorterClient } from "lib/ext/porter/client";
import { assert } from "lib/system/assert";

import { MessageType, Request, Response, RpcResponse } from "core/types";

export const porter = new PorterClient<Request, Response>();

export class ClientProvider extends JsonRpcProvider {
  constructor(chainId: number) {
    super("", chainId);
  }

  getNetwork = memoizeOne(super.getNetwork.bind(this));

  async send(method: string, params: Array<any>): Promise<any> {
    const type = MessageType.SendRpc;
    const { chainId } = this.network;

    const res = await porter.request({ type, chainId, method, params });
    assert(res?.type === type);

    return getResult(res.response);
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
