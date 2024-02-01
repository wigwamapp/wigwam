import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import useForceUpdate from "use-force-update";
import BigNumber from "bignumber.js";
import { useLazyAtomValue } from "lib/atom-utils";
import { usePrevious } from "lib/react-hooks/usePrevious";

import { AccountToken, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { getTokenAtom, getAccountTokensAtom } from "app/atoms";

import { useChainId } from "./chainId";
import { matchNativeToken } from "core/repo";
import { useAccounts } from "./account";

export type UseAccountTokensOptions = {
  withDisabled?: boolean;
  search?: string;
  limit?: number;
  onReset?: () => void;
};

export function useAllAccountTokens(
  tokenType: TokenType,
  accountAddress: string,
  { withDisabled, search, limit = 20, onReset }: UseAccountTokensOptions = {},
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
    [chainId, tokenType, accountAddress, withDisabled, search],
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
    [baseParams, offset, limit],
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

  const nativeToken = useToken(accountAddress);
  const restTokens = useLazyAtomValue(accountTokensAtom, "off");

  const pureTokens = useMemo(() => {
    if (tokenType !== TokenType.Asset) return restTokens;

    if (nativeToken && restTokens) {
      return search && !matchNativeToken(nativeToken, search)
        ? restTokens
        : [nativeToken, ...restTokens];
    }

    if (!nativeToken && restTokens?.length === 0) {
      return [];
    }

    return undefined;
  }, [tokenType, nativeToken, restTokens, search]);

  const prevTokens = usePrevious(pureTokens, "when-not-undefined");
  const tokens = pureTokens ?? prevTokens ?? [];

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

export function useAccountToken<T extends AccountToken>(tokenSlug: string) {
  const { currentAccount } = useAccounts();

  return useToken<T>(currentAccount.address, tokenSlug);
}

export function useToken<T extends AccountToken>(
  accountAddress: string,
  tokenSlug: string = NATIVE_TOKEN_SLUG,
) {
  const chainId = useChainId();

  const params = useMemo(
    () => ({ chainId, accountAddress, tokenSlug }),
    [chainId, accountAddress, tokenSlug],
  );

  const atom = loadable(getTokenAtom(params));
  const value = useAtomValue(atom);

  const data = value.state === "hasData" ? value.data : undefined;
  const prevData = usePrevious(data, "when-not-undefined");

  let token = (value.state === "loading" ? prevData : data) as T | undefined;

  // For better sync UX
  token = token?.portfolioUSD !== "-1" ? token : undefined;

  // portfolioUSD needs more time to resync
  if (token?.portfolioUSD) {
    token.portfolioUSD = BigNumber.max(
      token.portfolioUSD,
      token.balanceUSD,
    ).toString();
  }

  return token;
}
