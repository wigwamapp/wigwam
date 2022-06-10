import { assert } from "lib/system/assert";

import { Permission, ActivitySource } from "core/types";

export function wrapPermission(p: Permission) {
  return {
    caveats: [
      {
        type: "restrictReturnedAccounts",
        value: p.accountAddresses,
      },
    ],
    date: p.timeAt,
    id: p.id,
    invoker: p.origin,
    parentCapability: "eth_accounts",
  };
}

export function getPageOrigin(source: ActivitySource) {
  assert(source.type === "page");
  return new URL(source.url).origin;
}
