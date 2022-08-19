import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { nanoid } from "nanoid";
import { assert as assertSchema } from "superstruct";
import { assert } from "lib/system/assert";

import { approvalAdded } from "core/back/state";
import { ActivitySource, ActivityType, RpcReply } from "core/types";

import {
  validatePermission,
  validateNetwork,
  validateAccount,
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
  let accountAddress: string;

  try {
    txParams = omitEmptyProps(txParams);
    accountAddress = ethers.utils.getAddress(txParams.from);

    if ("gas" in txParams) {
      const { gas, ...rest } = txParams;
      txParams = { ...rest, gasLimit: gas };
    }

    assertSchema(txParams, TxParamsSchema);
    assert(txParams.to || txParams.data);
  } catch (err) {
    console.warn(err);

    throw ethErrors.rpc.invalidParams();
  }

  validateAccount(source, accountAddress);

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

function omitEmptyProps(obj: Record<string, any>) {
  obj = { ...obj };
  for (const prop of Object.keys(obj)) {
    if (!obj[prop]) delete obj[prop];
  }
  return obj;
}
