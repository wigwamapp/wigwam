import { useCallback, useEffect, useMemo, useRef } from "react";
import useForceUpdate from "use-force-update";
import { useLazyAtomValue } from "lib/atom-utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { getTokenActivityAtom } from "app/atoms";

import { useChainId } from "./chainId";

export type UseTokenActivityOptions = {
  search?: string;
  limit?: number;
};

export function useTokenActivity(
  accountAddress: string,
  tokenSlug: string = NATIVE_TOKEN_SLUG,
  { limit = 20 }: UseTokenActivityOptions = {}
) {
  const chainId = useChainId();
  const forceUpdate = useForceUpdate();

  const baseParams = useMemo(
    () => ({
      chainId,
      accountAddress,
      tokenSlug,
    }),
    [chainId, accountAddress, tokenSlug]
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
    [baseParams, offset, limit]
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
    "when-not-undefined"
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
