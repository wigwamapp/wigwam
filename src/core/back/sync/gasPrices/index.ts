import memoize from "mem";

import { GasPrices } from "core/types";

import { getOnChainLegacy } from "./onChainLegacy";
import { getIndexerGasPrices } from "./indexerApi";

const GAS_PRICES_WAYS = [getIndexerGasPrices, getOnChainLegacy];

export const estimateGasPrices = memoize(
  async (chainId: number): Promise<GasPrices> => {
    for (const fetchGasPrice of GAS_PRICES_WAYS) {
      try {
        const gasPrices = await fetchGasPrice(chainId);
        if (gasPrices) return gasPrices;
      } catch (err) {
        console.error(err);
      }
    }

    return null;
  },
  {
    maxAge: 5_000,
  },
);
