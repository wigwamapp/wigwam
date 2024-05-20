import BigNumber from "bignumber.js";

import {
  Activity,
  ActivityType,
  TxActionType,
  TokenActivity,
  TxAction,
} from "core/types";
import * as repo from "core/repo";
import { getPageOrigin } from "core/common/permissions";
import { createTokenActivityKey } from "core/common/tokens";

export async function saveActivity(activity: Activity | Activity[]) {
  const activities = Array.isArray(activity) ? activity : [activity];

  // Replace TX first
  for (const activity of activities) {
    if (
      activity.type === ActivityType.Transaction &&
      activity.source.replaceTx
    ) {
      const { prevActivityId, prevTxHash } = activity.source.replaceTx;

      await repo.activities.delete(prevActivityId);
      await repo.tokenActivities
        .where({ txHash: prevTxHash, pending: 1 })
        .delete();
    }
  }

  await repo.activities.bulkPut(activities).catch(console.error);

  for (const activity of activities) {
    if (activity.type === ActivityType.Connection) {
      // Remove all early connections to the same origin
      const actOrigin = getPageOrigin(activity.source);

      repo.activities
        .where("[type+accountAddress+pending]")
        .equals([ActivityType.Connection, activity.accountAddress, 0])
        .filter(
          (act) =>
            act.id !== activity.id && getPageOrigin(act.source) === actOrigin,
        )
        .delete()
        .catch(console.error);
    }
  }
}

export async function saveTokenActivity(
  action: TxAction | null,
  chainId: number,
  accountAddress: string,
  txHash: string,
  timeAt: number,
) {
  try {
    if (action) {
      const tokenActivities = new Map<string, TokenActivity>();
      const addToActivities = (activity: TokenActivity) => {
        const dbKey = createTokenActivityKey(activity);
        tokenActivities.set(dbKey, activity);
      };

      const base = {
        chainId,
        accountAddress,
        txHash,
        pending: 1,
        timeAt,
      };

      if (action.type === TxActionType.TokenTransfer) {
        for (const { slug: tokenSlug, amount } of action.tokens) {
          addToActivities({
            ...base,
            type: "transfer",
            anotherAddress: action.toAddress,
            amount: new BigNumber(amount).times(-1).toString(),
            tokenSlug,
          });
        }
      } else if (
        action.type === TxActionType.TokenApprove &&
        action.tokenSlug
      ) {
        addToActivities({
          ...base,
          type: "approve",
          anotherAddress: action.toAddress,
          tokenSlug: action.tokenSlug,
          amount: action.amount,
          clears: action.clears,
        });
      }

      if (tokenActivities.size > 0) {
        await repo.tokenActivities.bulkPut(
          Array.from(tokenActivities.values()),
          Array.from(tokenActivities.keys()),
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}
