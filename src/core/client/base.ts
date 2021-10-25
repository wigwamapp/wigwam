import { BaseProvider } from "@ethersproject/providers";
import { PorterClient } from "lib/ext/porter/client";
import { assert } from "lib/system/assert";

import { MessageType, Request, Response } from "core/types";

export const porter = new PorterClient<Request, Response>();

export class ClientProvider extends BaseProvider {
  constructor(chainId: number) {
    super(chainId);
  }

  async detectNetwork() {
    return this.network;
  }

  async perform(method: string, params: any): Promise<any> {
    const type = MessageType.PerformRpc;
    const { chainId } = this.network;

    const res = await porter.request({ type, chainId, method, params });
    assert(res?.type === type);

    return res.result;
  }
}
