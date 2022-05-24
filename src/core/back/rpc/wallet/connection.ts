import { nanoid } from "nanoid";
import { ethErrors } from "eth-rpc-errors";
import { openOrFocusMainTab } from "lib/ext/utils";

import {
  ActivitySource,
  RpcReply,
  ActivityType,
  WalletStatus,
} from "core/types";
import { $walletStatus, approvalAdded } from "core/back/state";

import { validateNetwork } from "./validation";

export async function requestConnection(
  source: ActivitySource,
  params: any[],
  rpcReply: RpcReply
) {
  const status = $walletStatus.getState();
  if (status === WalletStatus.Welcome) {
    openOrFocusMainTab();
    rpcReply({ error: ethErrors.provider.userRejectedRequest() });
    return;
  }

  let preferredChainId = parseChainId(params[0]);
  if (preferredChainId) {
    try {
      await validateNetwork(preferredChainId);
    } catch {
      preferredChainId = undefined;
    }
  }

  approvalAdded({
    id: nanoid(),
    type: ActivityType.Connection,
    source,
    timeAt: Date.now(),
    preferredChainId,
    rpcReply,
  });
}

function parseChainId(val: any): number | undefined {
  val = typeof val === "number" ? val : +val;
  return val > 0 ? val : undefined;
}
