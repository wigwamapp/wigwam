import { onRampCurrenciesAtom, tokenSlugAtom } from "app/atoms";
import { useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";
import { useMemo } from "react";

import { useChainId } from "./chainId";

const useRamp = (localTokenSlug?: string) => {
  const onRampCurrencies = useLazyAtomValue(onRampCurrenciesAtom);
  const globalTokenSlug = useAtomValue(tokenSlugAtom);
  const chainId = useChainId();

  const tokenSlug = localTokenSlug ?? globalTokenSlug;

  const chainTokenSlug = useMemo(
    () => (tokenSlug && chainId ? `${chainId}_${tokenSlug}` : null),
    [chainId, tokenSlug],
  );

  const onRampTokensInChain = useMemo(() => {
    return Object.values(onRampCurrencies ?? {}).filter(
      (item: any) => Number(item.chainId) === chainId,
    );
  }, [chainId, onRampCurrencies]);

  const onRampCurrency = useMemo(() => {
    if (
      chainTokenSlug &&
      onRampCurrencies &&
      chainTokenSlug in onRampCurrencies
    ) {
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
