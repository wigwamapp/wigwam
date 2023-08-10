import memoize from "mem";

import { GasPrices } from "core/types";

import { getOnChainEIP1559 } from "./onChainEIP1559";
import { getOnChainLegacy } from "./onChainLegacy";
import { getPolygonGasPrices } from "./polygonGasStation";
import { getDebankGasPrices } from "./debank";

const GAS_PRICES_WAYS = [
  getPolygonGasPrices,
  getOnChainEIP1559,
  getDebankGasPrices,
  getOnChainLegacy,
];

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
