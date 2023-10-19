import { ethers } from "ethers";
import memoizeOne from "memoize-one";
import memoize from "mem";

import { RpcResponse } from "core/types";

export async function sendRpc(
  chainId: number,
  url: string,
  method: string,
  params: any[],
): Promise<RpcResponse> {
  // console.info("Perform RPC request", { chainId, url, method, params });

  const rpcProvider = getRpcProvider(url, chainId);

  const getResult = async () => {
    switch (method) {
      /**
       * Cached
       */
      case "eth_chainId":
        return rpcProvider.getChainId().then(numToHex);

      case "net_version":
        return rpcProvider.getChainId();

      case "eth_blockNumber":
        return rpcProvider.getBlockNumber().then(numToHex);

      // case "eth_getBlockByHash":
      // case "eth_getBlockByNumber":
      //   TODO: Implement or suggest non-formatted version of this method
      //   return rpcProvider.getBlock(params[0], params[1]);

      /**
       * Rest
       */
      default:
        return rpcProvider.send(method, params);
    }
  };

  try {
    return { result: await getResult() };
  } catch (err: any) {
    if (typeof err?.error === "object") {
      const { message, code, data } = err.error;

      return {
        error: { message, code, data },
      };
    } else {
      return {
        error: INTERNAL_JSONRPC_ERROR,
      };
    }
  }
}

const getRpcProvider = memoize(
  (url: string, chainId: number) => new RpcProvider(url, chainId),
);

class RpcProvider extends ethers.JsonRpcProvider {
  getNetwork = memoizeOne(super.getNetwork.bind(this));

  getChainId = () => this.getNetwork().then(({ chainId }) => chainId);

  constructor(url: string, chainId: number) {
    super(url, chainId, { staticNetwork: ethers.Network.from(chainId) });

    // To use cache first provider._getBlock(), but without formatting
    // this.formatter = getRpcFormatter();
  }
}

// const getRpcFormatter = memoizeOne(() => {
//   const formatter = new ethers.Formatter();
//   formatter.block = formatBlockData;
//   formatter.blockWithTransactions = formatBlockData;

//   return formatter;
// });

// function formatBlockData(data: any) {
//   // Fix using getBlock() function with Celo,
//   // invalid RPC response from Celo by design
//   // @see https://github.com/ethers-io/ethers.js/issues/1735
//   return {
//     ...data,
//     gasLimit: data.gasLimit ?? "0x0",
//   };
// }

function numToHex(value: number | bigint): string {
  return `0x${value.toString(16)}`;
}

const INTERNAL_JSONRPC_ERROR = {
  code: -32603,
  message: "Internal JSON-RPC error.",
};
