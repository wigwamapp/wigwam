import { ethers } from "ethers";
// import { providers as multicallProviders } from "@0xsequence/multicall";
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

  const { plainProvider } = getProvider(url, chainId);

  const getResult = async () => {
    switch (method) {
      /**
       * Cached
       */
      case "eth_chainId":
        return plainProvider.getChainId().then(numToHex);

      case "net_version":
        return plainProvider.getChainId();

      case "eth_blockNumber":
        return plainProvider.getBlockNumber().then(numToHex);

      // case "eth_getBlockByHash":
      // case "eth_getBlockByNumber":
      //   return plainProvider.getBlock(params[0], params[1]);

      /**
       * Multicall
       */
      // case "eth_getBalance":
      //   return multicallProvider
      //     .getBalance(params[0], params[1])
      //     .then((b) => b.toHexString());

      // case "eth_getCode":
      //   return multicallProvider.getCode(params[0], params[1]);

      // case "eth_call":
      //   return multicallProvider.call(params[0], params[1]);

      /**
       * Rest
       */
      default:
        return plainProvider.send(method, params);
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

const getProvider = memoize((url: string, chainId: number) => {
  const plainProvider = new RpcProvider(url, chainId);
  // const multicallProvider = new multicallProviders.MulticallProvider(
  //   plainProvider,
  // );

  return { plainProvider };
});

class RpcProvider extends ethers.JsonRpcProvider {
  getNetwork = memoizeOne(super.getNetwork.bind(this));

  getChainId = () => this.getNetwork().then(({ chainId }) => chainId);

  constructor(url: string, network?: ethers.Networkish) {
    super(url, network);

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
