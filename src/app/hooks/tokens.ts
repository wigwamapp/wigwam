import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtomValue } from "jotai";
import useForceUpdate from "use-force-update";
import { KeepPrevious, useLazyAtomValue } from "lib/atom-utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { AccountAsset, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import {
  currentAccountAtom,
  getTokenAtom,
  getAccountTokensAtom,
} from "app/atoms";

import { useChainId } from "./chainId";
import { matchNativeToken } from "core/repo";
import { loadable } from "jotai/utils";

export type UseAccountTokensOptions = {
  withDisabled?: boolean;
  search?: string;
  limit?: number;
  onReset?: () => void;
};

export function useAccountTokens(
  tokenType: TokenType,
  accountAddress: string,
  { withDisabled, search, limit = 20, onReset }: UseAccountTokensOptions = {}
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

  if (prevBaseParams && baseParams !== prevBaseParams) {
    offsetRef.current = 0;
  }

  useEffect(() => {
    if (prevBaseParams && baseParams !== prevBaseParams) {
      onReset?.();
    }
  }, [prevBaseParams, baseParams, onReset]);

  const offset = offsetRef.current;
  const queryParams = useMemo(
    () => ({
      ...baseParams,
      withNative: false,
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

  const nativeToken = useToken(NATIVE_TOKEN_SLUG);
  const restTokens = useLazyAtomValue(accountTokensAtom);

  const tokens = useMemo(() => {
    if (nativeToken && restTokens) {
      if (search && !matchNativeToken(nativeToken, search)) {
        return restTokens;
      }

      return [nativeToken, ...restTokens];
    }

    return [];
  }, [nativeToken, restTokens, search]);

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

export function useToken(tokenSlug: string | null, onReset?: () => void) {
  const chainId = useChainId();
  const { address: accountAddress } = useAtomValue(currentAccountAtom);

  const params = useMemo(
    () => ({ chainId, accountAddress, tokenSlug }),
    [chainId, accountAddress, tokenSlug]
  );

  const prevTokenSlugRef = useRef<typeof tokenSlug>();

  useEffect(() => {
    if (prevTokenSlugRef.current === tokenSlug) {
      onReset?.();
    }

    prevTokenSlugRef.current = tokenSlug;
  }, [onReset, params, tokenSlug]);

  const asset = useLazyAtomValue(getTokenAtom(params), KeepPrevious.Always);

  return asset;
}

export function useAccountNativeToken(accountAddress: string) {
  const chainId = useChainId();
  const tokenSlug = NATIVE_TOKEN_SLUG;

  const params = useMemo(
    () => ({ chainId, accountAddress, tokenSlug }),
    [chainId, accountAddress, tokenSlug]
  );

  const atom = loadable(getTokenAtom(params));
  const value = useAtomValue(atom);

  const data = value.state === "hasData" ? value.data : undefined;
  const prevDataRef = useRef<typeof data>();

  useEffect(() => {
    if (data) prevDataRef.current = data;
  }, [data]);

  const lazyData = data ?? prevDataRef.current;

  return (value.state === "loading" ? lazyData : data) as
    | AccountAsset
    | undefined;
}

// export function useAccountNativeToken(accountAddress: string) {
//   const chainId = useChainId();
//   const tokenSlug = NATIVE_TOKEN_SLUG;

//   const params = useMemo(
//     () => ({ chainId, accountAddress, tokenSlug }),
//     [chainId, accountAddress, tokenSlug]
//   );

//   const token = useLazyAtomValue(getTokenAtom(params));

//   return token as AccountAsset | undefined;
// }
