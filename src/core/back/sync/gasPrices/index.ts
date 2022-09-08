import memoize from "mem";

import { TPGasPrices } from "core/types";

import { getPolygonGasPrices } from "./polygonGasStation";
import { getDebankGasPrices } from "./debank";

const GAS_PRICES_WAYS = [getPolygonGasPrices, getDebankGasPrices];

export const getTPGasPrices = memoize(
  async (chainId: number): Promise<TPGasPrices> => {
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
    maxAge: 30_000,
  }
);
