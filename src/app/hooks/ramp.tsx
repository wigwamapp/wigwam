import { onRampCurrenciesAtom, tokenSlugAtom } from "app/atoms";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { useChainId } from "./chainId";

const useRamp = () => {
  const onRampCurrencies = useAtomValue(onRampCurrenciesAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const chainId = useChainId();

  const chainTokenSlug = useMemo(
    () => (tokenSlug && chainId ? `${chainId}_${tokenSlug}` : null),
    [chainId, tokenSlug],
  );

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
      onRampSlug: chainTokenSlug,
    }),
    [onRampCurrencies, onRampCurrency, chainTokenSlug],
  );
};

export { useRamp };
