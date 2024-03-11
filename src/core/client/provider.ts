import { ethers } from "ethers";
import memoizeOne from "memoize-one";
import memoize from "mem";
import { assert } from "lib/system/assert";

import { MessageType, RpcResponse, ActivitySource } from "core/types";

import { porter } from "./base";

export const getClientProvider = memoize(
  (chainId: number) => new ClientProvider(chainId),
);

export class ClientProvider extends ethers.JsonRpcApiProvider {
  constructor(public chainId: number) {
    super(chainId);
  }
  source?: ActivitySource;

  getNetwork = memoizeOne(super.getNetwork.bind(this));
  getCode = memoize(super.getCode.bind(this));

  getUncheckedSigner = memoize(
    (address: string) => new ethers.JsonRpcSigner(this, address),
  );
  getVoidSigner = memoize(
    (address: string) => new ethers.VoidSigner(address, this),
  );

  setActivitySource = (source?: ActivitySource) => {
    this.source = source;
  };

  async send(method: string, params: Array<any>): Promise<any> {
    const res = await this.sendRpc(method, params);

    return getResult(res.response);
  }

  async _send(
    payload: ethers.JsonRpcPayload | Array<ethers.JsonRpcPayload>,
  ): Promise<Array<ethers.JsonRpcResult>> {
    const payloadArr = Array.isArray(payload) ? payload : [payload];

    const responses = await Promise.all(
      payloadArr.map(async ({ jsonrpc, id, method, params }) => {
        // TODO: Check JSONRPC params types
        const res = await this.sendRpc(method, params as any);

        return { jsonrpc, id, ...res.response };
      }),
    );

    return responses as any;
  }

  async populateTransaction(transaction: Partial<ethers.TransactionRequest>) {
    return transaction;
  }

  private async sendRpc(method: string, params: Array<any>) {
    const type = MessageType.SendRpc;
    const chainId = this.chainId;

    const res = await porter.request(
      { type, chainId, method, params, source: this.source },
      { timeout: 0 },
    );
    assert(res?.type === type);

    return res;
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
