import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { nanoid } from "nanoid";
import { assert as assertSchema } from "superstruct";
import { assert } from "lib/system/assert";

import { $accountAddresses, approvalAdded } from "core/back/state";
import { ActivitySource, ActivityType, RpcReply } from "core/types";

import {
  validatePermission,
  validateNetwork,
  TxParamsSchema,
} from "./validation";

export async function requestTransaction(
  source: ActivitySource,
  chainId: number,
  params: any[],
  rpcReply: RpcReply
) {
  validatePermission(source);
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
    throw ethErrors.rpc.invalidParams();
  }

  const accountAddress = ethers.utils.getAddress(txParams.from);

  if (
    source.type === "page" &&
    !source.permission?.accountAddresses.includes(accountAddress)
  ) {
    throw ethErrors.provider.unauthorized();
  }

  if (!$accountAddresses.getState().includes(accountAddress)) {
    throw ethErrors.rpc.resourceUnavailable();
  }

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
