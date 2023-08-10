import { ethErrors } from "eth-rpc-errors";
import { assert } from "lib/system/assert";

import { RpcContext, ActivitySource } from "core/types";
import * as repo from "core/repo";
import { getPageOrigin } from "core/common/permissions";

import {
  assertWalletSetuped,
  validateNetwork,
  createJustNetworkPermission,
} from "./validation";

export async function requestSwitchChain(
  rpcCtx: RpcContext,
  type: "add" | "switch",
  source: ActivitySource,
  params: any[],
) {
  assertWalletSetuped();

  let chainId: number;
  try {
    chainId = parseInt(params[0].chainId);
    assert(!isNaN(chainId));
  } catch {
    throw ethErrors.rpc.invalidParams();
  }

  try {
    await validateNetwork(chainId);
  } catch {
    if (type === "add") {
      throw ethErrors.provider.unsupportedMethod();
    }

    const error = ethErrors.rpc.resourceNotFound("Network not been added");
    error.code = 4902;
    throw error;
  }

  assert(source.type === "page");
  const origin = getPageOrigin(source);

  if (source.permission || (await repo.permissions.get(origin))) {
    await repo.permissions.where({ origin }).modify((perm) => {
      perm.chainId = chainId;
    });
  } else {
    await createJustNetworkPermission(origin, chainId);
  }

  rpcCtx.reply({ result: null });
}
