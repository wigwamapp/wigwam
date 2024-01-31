import { useCallback, useEffect, useMemo, useRef } from "react";
import useForceUpdate from "use-force-update";
import { useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import {
  approvalStatusAtom,
  getActivitiesAtom,
  getPendingActivitiesAtom,
  getTokenActivityAtom,
} from "app/atoms";

import { useChainId } from "./chainId";
import { useAccounts } from "./account";

export type UseTokenActivityOptions = {
  search?: string;
  limit?: number;
};

export function useTokenActivity(
  accountAddress: string,
  tokenSlug: string = NATIVE_TOKEN_SLUG,
  { limit = 20 }: UseTokenActivityOptions = {},
) {
  const chainId = useChainId();
  const forceUpdate = useForceUpdate();

  const baseParams = useMemo(
    () => ({
      chainId,
      accountAddress,
      tokenSlug,
    }),
    [chainId, accountAddress, tokenSlug],
  );
  const prevBaseParams = usePrevious(baseParams);

  const offsetRef = useRef(0);

  if (prevBaseParams && baseParams !== prevBaseParams) {
    offsetRef.current = 0;
  }

  const offset = offsetRef.current;
  const queryParams = useMemo(
    () => ({
      ...baseParams,
      limit: offset + limit,
    }),
    [baseParams, offset, limit],
  );

  const tokenActivityAtom = getTokenActivityAtom(queryParams);
  const prevQueryParamsRef = useRef<typeof queryParams>();

  useEffect(() => {
    // Cleanup atoms cache
    if (prevQueryParamsRef.current) {
      getTokenActivityAtom.remove(prevQueryParamsRef.current);
    }

    prevQueryParamsRef.current = queryParams;
  }, [queryParams]);

  const pureTokenActivity = useLazyAtomValue(tokenActivityAtom, "off");

  const prevTokenActivity = usePrevious(
    pureTokenActivity,
    "when-not-undefined",
  );
  const activity = pureTokenActivity ?? prevTokenActivity ?? [];

  const hasMore = offsetRef.current <= activity.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;

    offsetRef.current += limit;
    forceUpdate();
  }, [forceUpdate, hasMore, limit]);

  return {
    activity,
    hasMore,
    loadMore,
  };
}

export function useCompleteActivity(accountAddress: string, limit = 20) {
  const forceUpdate = useForceUpdate();
  const offsetRef = useRef(0);

  const offset = offsetRef.current;
  const queryParams = useMemo(
    () => ({
      accountAddress,
      limit: offset + limit,
    }),
    [accountAddress, offset, limit],
  );

  const activitiesAtom = getActivitiesAtom(queryParams);
  const prevQueryParamsRef = useRef<typeof queryParams>();

  useEffect(() => {
    // Cleanup atoms cache
    if (prevQueryParamsRef.current) {
      getActivitiesAtom.remove(prevQueryParamsRef.current);
    }

    prevQueryParamsRef.current = queryParams;
  }, [queryParams]);

  const activity = useLazyAtomValue(activitiesAtom);

  const hasMore =
    activity !== undefined && offsetRef.current <= activity.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;

    offsetRef.current += limit;
    forceUpdate();
  }, [forceUpdate, hasMore, limit]);

  return {
    activity,
    hasMore,
    loadMore,
  };
}

export function useActivityBadge() {
  const { currentAccount } = useAccounts();
  const { total: totalApprovals } = useAtomValue(approvalStatusAtom);
  const pendingActivities = useLazyAtomValue(
    getPendingActivitiesAtom(currentAccount.address),
  );
  const totalPendingActivities = useMemo(
    () => pendingActivities?.length ?? 0,
    [pendingActivities],
  );

  return useMemo(
    () => totalApprovals > 0 || totalPendingActivities > 0,
    [totalApprovals, totalPendingActivities],
  );
}
