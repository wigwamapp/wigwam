import { JsonRpcProvider } from "@ethersproject/providers";
import { providers as multicallProviders } from "@0xsequence/multicall";
import mem from "mem";

import { RpcResponse } from "core/types";

export async function sendRpc(
  chainId: number,
  url: string,
  method: string,
  params: any
): Promise<RpcResponse> {
  console.info("Perform RPC request", { chainId, url, method, params });

  const { plainProvider, multicallProvider } = await getProvider(url, chainId);

  const getResult = async () => {
    switch (method) {
      // Cached
      case "eth_chainId":
        return chainId;

      case "eth_blockNumber":
        return plainProvider.getCachedBlockNumber();

      // Multicall
      case "eth_getBalance":
        return multicallProvider.getBalance(params[0], params[1]);

      case "eth_getCode":
        return multicallProvider.getCode(params[0], params[1]);

      case "eth_call":
        return multicallProvider.call(params[0], params[1]);

      default:
        return plainProvider.send(method, params);
    }
  };

  try {
    return { result: await getResult() };
  } catch (err: any) {
    return {
      error: {
        message: err?.message,
        code: err?.code,
        data: err?.data,
      },
    };
  }
}

const getProvider = mem(async (url: string, chainId: number) => {
  const plainProvider = new RpcProvider(url, chainId);
  const multicallProvider = new multicallProviders.MulticallProvider(
    plainProvider
  );

  return { plainProvider, multicallProvider };
});

class RpcProvider extends JsonRpcProvider {
  private _cachedBlockNumber?: number;

  constructor(url: string, chainId: number) {
    super(url, chainId);

    this.on("block", (blockNumber) => {
      this._cachedBlockNumber = blockNumber;
    });
  }

  async detectNetwork() {
    return this.network;
  }

  async getCachedBlockNumber() {
    return this._cachedBlockNumber ?? this.getBlockNumber();
  }
}
