import { ethers } from "ethers";
import { nanoid } from "nanoid";
import { assert as assertSchema } from "superstruct";
import { assert } from "lib/system/assert";

import { $accounts, approvalAdded } from "core/back/state";
import { ActivitySource, ActivityType, RpcReply } from "core/types";

import { validateNetwork, TxParamsSchema } from "./validation";

export async function requestTransaction(
  source: ActivitySource,
  chainId: number,
  params: any[],
  rpcReply: RpcReply
) {
  await validateNetwork(chainId);

  let txParams = params?.[0];
  if ("gas" in txParams) {
    const { gas, ...rest } = txParams;
    txParams = { ...rest, gasLimit: gas };
  }

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
    source,
    timeAt: Date.now(),
    chainId,
    accountAddress,
    txParams,
    rpcReply,
  });
}
