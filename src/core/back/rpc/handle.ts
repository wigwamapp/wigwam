import { RpcReply } from "core/types";

import { sendRpc } from "./network";
import { sendTransaction } from "./wallet";

export async function handleRpc(
  chainId: number,
  method: string,
  params: any[],
  reply: RpcReply
) {
  try {
    switch (method) {
      // case "eth_accounts":

      case "eth_sendTransaction":
        return sendTransaction(chainId, params, reply);

      default:
        reply(await sendRpc(chainId, method, params));
    }
  } catch (err: any) {
    // @TODO: Handle non rpc errors, and wrap them to rpc format
    reply({ error: { message: err.message } });
  }
}
