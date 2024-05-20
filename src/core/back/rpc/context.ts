import { MessageContext } from "lib/ext/porter/server";

import {
  RpcMessageContext,
  RpcResponse,
  WalletRpcMsgContext,
  PorterChannel,
  RpcContext,
  SerializedRpcContext,
} from "core/types";

/**
 * The `RpcContext` class is used to send a response to a remote procedure call
 * (RPC) request, formatting the response based on the type of RPC context.
 *
 * There are two types of rpcCtx - for Wallet(Internal views) and for Page(DApps).
 * For page - the typical eth rpc format
 * For wallet - custom format since Porter already has req/res mechanics
 * @param {RpcMessageContext | undefined} msgCtx - The `rpcCtx` parameter is an
 * object that represents the Porter context of the RPC (Remote Procedure Call) message.
 * It contains information about the RPC message, such as the type of the message,
 * the data associated with the message, and the method to reply to the message.
 * @param {RpcResponse} response - is an object that represents the response
 * to be sent back in the RPC reply.
 */
export class RpcCtx implements RpcContext {
  static from({ portId, msg }: SerializedRpcContext) {
    const msgCtx = new MessageContext<any, any>(portId, msg);
    return new RpcCtx(msgCtx);
  }

  serialize(): SerializedRpcContext {
    return { portId: this.msgCtx.portId, msg: this.msgCtx.msg };
  }

  constructor(private msgCtx: RpcMessageContext) {}

  reply(response: RpcResponse) {
    if ("error" in response) {
      // Send plain object, not an Error instance
      // Also remove error stack
      const { message, code, data } = response.error;
      response = {
        error: { message, code, data },
      };
    }

    if (isWalletRpc(this.msgCtx)) {
      this.msgCtx.reply({
        type: this.msgCtx.data.type,
        response,
      });
    } else {
      const { id, jsonrpc } = this.msgCtx.data;

      this.msgCtx.reply({
        id,
        jsonrpc,
        ...response,
      });
    }
  }
}

function isWalletRpc(
  rpcCtx: MessageContext<any, any>,
): rpcCtx is WalletRpcMsgContext {
  return rpcCtx.port?.name.startsWith(PorterChannel.Wallet) ?? false;
}
