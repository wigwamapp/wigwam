import { useAtomValue } from "jotai";
// import { usePrevious } from "lib/react-hooks/usePrevious";

import { TokenType } from "core/types";

import { useChainId } from "./chainId";
import { getAccountTokensAtom } from "app/atoms/tokens";
import { useEffect, useMemo, useRef } from "react";

export type UseAccountTokensOptions = {
  withDisabled?: boolean;
  search?: string;
};

export function useAccountTokens(
  tokenType: TokenType,
  accountAddress: string,
  { withDisabled, search }: UseAccountTokensOptions = {}
) {
  const chainId = useChainId();

  const getAtomParams = useMemo(
    () => ({
      chainId,
      tokenType,
      accountAddress,
      withDisabled,
      search,
    }),
    [chainId, tokenType, accountAddress, withDisabled, search]
  );

  const prevGetAtomParamsRef = useRef<typeof getAtomParams>();

  useEffect(() => {
    // Cleanup atoms cache
    if (prevGetAtomParamsRef.current) {
      getAccountTokensAtom.remove(prevGetAtomParamsRef.current);
    }

    prevGetAtomParamsRef.current = getAtomParams;
  }, [getAtomParams]);

  const accountTokens = useAtomValue(getAccountTokensAtom(getAtomParams));

  return accountTokens;
}
