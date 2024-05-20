import { nanoid } from "nanoid";
import { ethErrors } from "eth-rpc-errors";
import { assert } from "lib/system/assert";
import { isValidHttpsUrl } from "lib/system/isValidHttpsUrl";

import {
  RpcContext,
  ActivitySource,
  ActivityType,
  AddEthereumChainParameter,
} from "core/types";
import * as repo from "core/repo";
import { getPageOrigin } from "core/common/permissions";
import { approvalAdded } from "core/back/state";

import {
  assertWalletSetuped,
  validateNetwork,
  validateAddNetworkParams,
} from "./validation";

export async function requestNetwork(
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
    // If network already exists - it will be `switch` for both cases
    type = "switch";
  } catch {
    if (type === "switch") {
      const error = ethErrors.rpc.resourceNotFound("Network not been added");
      error.code = 4902;
      throw error;
    }
  }

  assert(source.type === "page");
  const origin = getPageOrigin(source);

  if (type === "switch") {
    await repo.createOrUpdateNetworkPermission(origin, chainId);
    // TODO: If network already exists and the testnet - enable testnets

    rpcCtx.reply({ result: null });
  } else {
    const networkParams = params[0];
    formatUrls(networkParams);

    await validateAddNetworkParams(networkParams);

    approvalAdded({
      id: nanoid(),
      type: ActivityType.AddNetwork,
      source,
      timeAt: Date.now(),
      chainId,
      networkParams,
      rpcCtx,
    });
  }
}

function formatUrls(params: AddEthereumChainParameter) {
  try {
    params.rpcUrls = params.rpcUrls.filter(isValidHttpsUrl);
    params.blockExplorerUrls =
      params.blockExplorerUrls?.filter(isValidHttpsUrl);
    params.iconUrls = params.iconUrls?.filter(isValidHttpsUrl);
  } catch (err) {
    console.error(err);
  }
}
