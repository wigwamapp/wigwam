import { ethers } from "ethers";
import { nanoid } from "nanoid";
import { assert as assertSchema } from "superstruct";
import memoize from "mem";
import { assert } from "lib/system/assert";

import { $accounts, approvalAdded } from "core/back/state";
import { ActivityType, RpcReply } from "core/types";
import { getNetwork } from "core/common";

import { TxParamsSchema } from "./validation";

export async function sendTransaction(
  chainId: number,
  params: any[],
  rpcReply: RpcReply
) {
  await validateNetwork(chainId);

  const txParams = params?.[0];

  try {
    assertSchema(txParams, TxParamsSchema);
    assert(txParams.to || txParams.data);
  } catch {
    throw new Error("Invalid transaction");
  }

  const accountAddress = ethers.utils.getAddress(txParams.from);

  const allAccounts = $accounts.getState();
  assert(allAccounts.some((acc) => acc.address === accountAddress));

  approvalAdded({
    id: nanoid(),
    type: ActivityType.Transaction,
    source: { type: "self", kind: "unknown_transaction" },
    chainId,
    accountAddress,
    txParams,
    rpcReply,
  });
}

const validateNetwork = memoize(getNetwork);
