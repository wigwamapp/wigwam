import retry from "async-retry";

import { GasPrices } from "core/types";

import { getRpcProvider } from "../../rpc";

export async function getOnChainLegacy(chainId: number): Promise<GasPrices> {
  const provider = getRpcProvider(chainId);

  const chainGasPrice = await retry(() => provider.getGasPrice(), {
    retries: 2,
    minTimeout: 0,
    maxTimeout: 0,
  });

  const step = 10 ** (chainGasPrice.lt(10 ** 9) ? 7 : 8);

  return {
    type: "legacy",
    modes: {
      low: { max: chainGasPrice.sub(step).toString() },
      average: { max: chainGasPrice.toString() },
      high: { max: chainGasPrice.add(step).toString() },
    },
  };
}
