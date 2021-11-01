import { approvalItemAdded } from "core/back/state";
import { ActivityType, RpcReply } from "core/types";

export async function sendTransaction(
  chainId: number,
  params: any[],
  rpcReply: RpcReply
) {
  approvalItemAdded({
    type: ActivityType.Transaction,
    source: { type: "self", kind: "unknown_transaction" },
    chainId,
    txParams: params[0],
    rpcReply,
  });
}
