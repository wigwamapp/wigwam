import { ethErrors } from "eth-rpc-errors";
import { assert } from "lib/system/assert";

import { RpcReply, ActivitySource } from "core/types";
import * as repo from "core/repo";

import { validatePermission, validateNetwork } from "./validation";
import { getPageOrigin } from "core/common/permissions";

export async function requestSwitchChain(
  source: ActivitySource,
  params: any[],
  rpcReply: RpcReply
) {
  validatePermission(source);

  let chainId;
  try {
    chainId = parseInt(params[0].chainId);
    assert(!isNaN(chainId));
  } catch {
    throw ethErrors.rpc.invalidParams();
  }

  try {
    await validateNetwork(chainId);
  } catch {
    const error = ethErrors.rpc.resourceNotFound("Network not been added");
    error.code = 4902;
    throw error;
  }

  const origin = getPageOrigin(source);

  const newChainId = chainId; // deceive typescript >_<
  await repo.permissions.where({ origin }).modify((perm) => {
    perm.chainId = newChainId;
  });

  rpcReply({ result: null });
}
