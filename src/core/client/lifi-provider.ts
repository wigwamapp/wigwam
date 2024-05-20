import { JsonRpcProvider, TransactionRequest } from "@ethersproject/providers";
import memoizeOne from "memoize-one";
import memoize from "mem";
import { assert } from "lib/system/assert";

import { MessageType, RpcResponse, ActivitySource } from "core/types";

import { porter } from "./base";

export const getLiFiProvider = memoize(
  (chainId: number) => new ClientProvider(chainId),
);

export class ClientProvider extends JsonRpcProvider {
  constructor(public chainId: number) {
    super("", chainId);
  }
  source?: ActivitySource;

  getNetwork = memoizeOne(super.getNetwork.bind(this));
  getSigner = memoize(super.getSigner.bind(this));
  getCode = memoize(super.getCode.bind(this));
  getUncheckedSigner = memoize(super.getUncheckedSigner.bind(this));

  setActivitySource = (source?: ActivitySource) => {
    this.source = source;
  };

  async send(method: string, params: Array<any>): Promise<any> {
    const type = MessageType.SendRpc;
    const { chainId } = this.network;
    const res = await porter.request(
      { type, chainId, method, params, source: this.source },
      { timeout: 0 },
    );
    assert(res?.type === type);

    return getResult(res.response);
  }

  async populateTransaction(transaction: Partial<TransactionRequest>) {
    return transaction;
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
