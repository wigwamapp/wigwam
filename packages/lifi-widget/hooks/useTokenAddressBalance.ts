import { useMemo } from 'react';
import { getAddress } from '@ethersproject/address';
import { useTokenBalances } from './useTokenBalances';

export const useTokenAddressBalance = (
  chainId?: number,
  tokenAddress?: string,
) => {
  const { tokens, tokensWithBalance, isBalanceLoading, refetch } =
    useTokenBalances(chainId);

  const token = useMemo(() => {
    if (tokenAddress && chainId) {
      const token = (tokensWithBalance ?? tokens)?.find(
        (token) => getAddress(token.address) === getAddress(tokenAddress) && token.chainId === chainId,
      );
      return token;
    }
  }, [chainId, tokenAddress, tokens, tokensWithBalance]);

  return {
    token,
    isLoading: isBalanceLoading,
    refetch,
  };
};
