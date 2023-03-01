import { nanoid } from "nanoid";

import { ActivitySource, RpcReply, ActivityType } from "core/types";
import * as repo from "core/repo";
import { getPageOrigin, wrapPermission } from "core/common/permissions";
import { approvalAdded } from "core/back/state";

import { assertWalletSetuped } from "./validation";

export async function requestConnection(
  source: ActivitySource,
  params: any[],
  returnSelectedAccount: boolean,
  rpcReply: RpcReply
) {
  assertWalletSetuped({ openIfNotSetuped: true });

  // It can be good feature
  // dApp can set preferred chain id when it starts connection
  // But this flow doesn't exist in spec
  // ------
  // let preferredChainId = parseChainId(params[0]);
  // if (preferredChainId) {
  //   try {
  //     await validateNetwork(preferredChainId);
  //   } catch {
  //     preferredChainId = undefined;
  //   }
  // }

  approvalAdded({
    id: nanoid(),
    type: ActivityType.Connection,
    source,
    timeAt: Date.now(),
    returnSelectedAccount,
    rpcReply,
  });
}

export async function fetchPermission(source: ActivitySource, reply: RpcReply) {
  const origin = getPageOrigin(source);
  const permission = await repo.permissions.get(origin);
  const result = (permission ? [permission] : []).map(wrapPermission);

  reply({ result });
}

// function parseChainId(val: any): number | undefined {
//   val = typeof val === "number" ? val : +val;
//   return val > 0 ? val : undefined;
// }
