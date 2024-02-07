import { onRampCurrenciesAtom, tokenSlugAtom } from "app/atoms";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { useChainId } from "./chainId";

export type RampCurrency = {
  chainId: string;
  id: string;
  image: string;
  network: string;
  symbol: string;
  name: string;
  address: string;
};

const useRamp = () => {
  const onRampCurrencies = useAtomValue(onRampCurrenciesAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const chainId = useChainId();

  const chainTokenSlug = useMemo(
    () => (tokenSlug && chainId ? `${chainId}_${tokenSlug}` : null),
    [chainId, tokenSlug],
  );

  const onRampTokensInChain = useMemo(() => {
    return Object.values(onRampCurrencies).filter(
      (item: any) => Number(item.chainId) === chainId,
    );
  }, [chainId, onRampCurrencies]);

  const onRampCurrency = useMemo(() => {
    if (chainTokenSlug && chainTokenSlug in onRampCurrencies) {
      return onRampCurrencies[chainTokenSlug];
    }

    return null;
  }, [onRampCurrencies, chainTokenSlug]);

  return useMemo(
    () => ({
      onRampCurrency,
      onRampCurrencies,
      onRampTokensInChain,
      onRampSlug: chainTokenSlug,
    }),
    [onRampCurrencies, onRampCurrency, chainTokenSlug, onRampTokensInChain],
  );
};

export { useRamp };
