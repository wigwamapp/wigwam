import memoize from "mem";

import * as repo from "core/repo";
import { createAccountTokenKey } from "core/common/tokens";
import { synced, syncStarted } from "core/back/state";

import { syncDxTokenActivities } from "./dx";
import { syncUxTokenActivities } from "./ux";
import { syncExplorerTokenActivities } from "./explorer";
import { syncChainTokenActivities } from "./chain";

export const syncTokenActivities = memoize(
  async (chainId: number, accountAddress: string, tokenSlug: string) => {
    const accTokenKey = createAccountTokenKey({
      chainId,
      accountAddress,
      tokenSlug,
    });

    syncStarted(accTokenKey);

    try {
      const token = await repo.accountTokens.get(accTokenKey);
      if (!token) return;

      for (const sync of [
        syncDxTokenActivities,
        syncUxTokenActivities,
        syncExplorerTokenActivities,
        syncChainTokenActivities,
      ]) {
        try {
          const success = await sync(token);
          if (success) break;
        } catch (err) {
          console.error(err);
        }
      }
    } finally {
      synced(accTokenKey);
    }
  },
  {
    maxAge: 40_000,
    cacheKey: (args) => args.join("_"),
  },
);
