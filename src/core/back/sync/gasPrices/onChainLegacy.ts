import retry from "async-retry";

import { GasPrices } from "core/types";

import { getRpcProvider } from "../../rpc";

export async function getOnChainLegacy(chainId: number): Promise<GasPrices> {
  const provider = getRpcProvider(chainId);

  const { gasPrice } = await retry(() => provider.getFeeData(), {
    retries: 2,
    minTimeout: 0,
    maxTimeout: 0,
  });

  if (!gasPrice) return null;

  const step = 10n ** (gasPrice < 10n ** 9n ? 7n : 8n);

  return {
    type: "legacy",
    modes: {
      low: { max: (gasPrice - step).toString() },
      average: { max: gasPrice.toString() },
      high: { max: (gasPrice + step).toString() },
    },
  };
}
