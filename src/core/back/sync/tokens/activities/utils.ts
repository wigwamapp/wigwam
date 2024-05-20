import * as repo from "core/repo";
import { createTokenActivityKey } from "core/common/tokens";
import { AccountToken, TokenActivity } from "core/types";

export function getLatestTokenActivity(token: AccountToken) {
  return repo.tokenActivities
    .where("[chainId+accountAddress+tokenSlug+pending]")
    .equals([token.chainId, token.accountAddress, token.tokenSlug, 0])
    .reverse()
    .first();
}

export function prepareTokenActivitiesRepo() {
  const tokenActivities = new Map<string, TokenActivity>();
  const blockNumbers = new Set<number>();

  const addToActivities = (activity: TokenActivity) => {
    const dbKey = createTokenActivityKey(activity);
    const existing = tokenActivities.get(dbKey);

    if (!existing) {
      tokenActivities.set(dbKey, activity);
    } else if (activity.type === "transfer") {
      existing.amount =
        existing.amount &&
        (BigInt(existing.amount) + BigInt(activity.amount)).toString();
    }

    blockNumbers.add(activity.timeAt);
  };

  const releaseToRepo = async () => {
    if (tokenActivities.size > 0) {
      await repo.tokenActivities.bulkPut(
        Array.from(tokenActivities.values()),
        Array.from(tokenActivities.keys()),
      );
    }
  };

  const getCurrentState = () => ({
    tokenActivities,
    blockNumbers,
  });

  return {
    addToActivities,
    releaseToRepo,
    getCurrentState,
  };
}
