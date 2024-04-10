import retry from "async-retry";

import { GasPrices } from "core/types";
import { getGasPriceStep } from "core/common/transaction";

import { getRpcProvider } from "../../rpc";

export async function getOnChainLegacy(chainId: number): Promise<GasPrices> {
  const provider = getRpcProvider(chainId);

  const { gasPrice } = await retry(() => provider.getFeeData(), {
    retries: 2,
    minTimeout: 0,
    maxTimeout: 0,
  });

  if (!gasPrice) return null;

  const step = getGasPriceStep(gasPrice);

  return {
    type: "legacy",
    modes: {
      low: { max: gasPrice.toString() },
      average: { max: (gasPrice + step).toString() },
      high: { max: (gasPrice + step * 2n).toString() },
    },
  };
}
