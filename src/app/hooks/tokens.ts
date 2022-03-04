import useForceUpdate from "use-force-update";
import { useLazyAtomValue } from "lib/atom-utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { TokenType } from "core/types";

import { useChainId } from "./chainId";
import { getAccountTokensAtom } from "app/atoms/tokens";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtomValue } from "jotai";
import { currentAccountAtom, getTokenAtom } from "app/atoms";

export type UseAccountTokensOptions = {
  withDisabled?: boolean;
  search?: string;
  limit?: number;
  onReset?: () => void;
};

export function useAccountTokens(
  tokenType: TokenType,
  accountAddress: string,
  { withDisabled, search, limit = 25, onReset }: UseAccountTokensOptions = {}
) {
  const forceUpdate = useForceUpdate();
  const chainId = useChainId();

  const baseParams = useMemo(
    () => ({
      chainId,
      tokenType,
      accountAddress,
      withDisabled,
      search,
    }),
    [chainId, tokenType, accountAddress, withDisabled, search]
  );
  const prevBaseParams = usePrevious(baseParams);

  const offsetRef = useRef(0);

  if (baseParams !== prevBaseParams) {
    offsetRef.current = 0;
    onReset?.();
  }

  const offset = offsetRef.current;
  const queryParams = useMemo(
    () => ({
      ...baseParams,
      limit: offset + limit,
    }),
    [baseParams, offset, limit]
  );

  const accountTokensAtom = getAccountTokensAtom(queryParams);
  const prevQueryParamsRef = useRef<typeof queryParams>();

  useEffect(() => {
    // Cleanup atoms cache
    if (prevQueryParamsRef.current) {
      getAccountTokensAtom.remove(prevQueryParamsRef.current);
    }

    prevQueryParamsRef.current = queryParams;
  }, [queryParams]);

  const tokens = useLazyAtomValue(accountTokensAtom) ?? [];

  const hasMore = offsetRef.current <= tokens.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;

    offsetRef.current += limit;
    forceUpdate();
  }, [forceUpdate, hasMore, limit]);

  return {
    tokens,
    hasMore,
    loadMore,
  };
}

export function useToken(tokenSlug: string) {
  const chainId = useChainId();
  const { address: accountAddress } = useAtomValue(currentAccountAtom);

  const params = useMemo(
    () => ({ chainId, accountAddress, tokenSlug }),
    [chainId, accountAddress, tokenSlug]
  );

  return useLazyAtomValue(getTokenAtom(params));
}
