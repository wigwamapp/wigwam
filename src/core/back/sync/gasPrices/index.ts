import memoize from "mem";

import { GasPrices } from "core/types";

import { getLineaGasPrices } from "./linea";
import { getIndexerGasPrices } from "./indexerApi";
import { getOnChainLegacy } from "./onChainLegacy";

const GAS_PRICES_WAYS = [
  getLineaGasPrices,
  getIndexerGasPrices,
  getOnChainLegacy,
];

export const estimateGasPrices = memoize(
  async (chainId: number): Promise<GasPrices> => {
    for (const fetchGasPrice of GAS_PRICES_WAYS) {
      try {
        const gasPrices = await fetchGasPrice(chainId);

        if (gasPrices) {
          avoidDuplicates(gasPrices);
          return gasPrices;
        }
      } catch (err) {
        console.error(err);
      }
    }

    return null;
  },
  {
    maxAge: 3_000,
  },
);

function avoidDuplicates(gasPrices: GasPrices) {
  if (!gasPrices) return;

  const { modes } = gasPrices;

  if (modes.low.max === modes.average.max) {
    modes.average.max = (BigInt(modes.average.max) + 1n).toString();
  }

  if (modes.average.max === modes.high.max) {
    modes.high.max = (BigInt(modes.high.max) + 1n).toString();
  }
}
