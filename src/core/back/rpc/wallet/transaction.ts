import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { nanoid } from "nanoid";
import { assert as assertSchema } from "superstruct";
import { assert } from "lib/system/assert";

import { RpcContext, ActivitySource, ActivityType } from "core/types";
import { approvalAdded } from "core/back/state";

import {
  validatePermission,
  validateNetwork,
  validateAccount,
  TxParamsSchema,
} from "./validation";

export async function requestTransaction(
  rpcCtx: RpcContext,
  source: ActivitySource,
  chainId: number,
  params: any[],
) {
  validatePermission(source);
  await validateNetwork(chainId);

  let txParams = params?.[0];
  let accountAddress: string;

  try {
    txParams = omitEmptyProps(txParams);
    accountAddress = ethers.getAddress(txParams.from);

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
    rpcCtx,
  });
}

function omitEmptyProps(obj: Record<string, any>) {
  obj = { ...obj };
  for (const prop of Object.keys(obj)) {
    if (!obj[prop]) delete obj[prop];
  }
  return obj;
}
