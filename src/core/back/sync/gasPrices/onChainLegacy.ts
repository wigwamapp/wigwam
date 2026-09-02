import retry from "async-retry";

import { FeeMode, GasPrices } from "core/types";
import { getGasPriceStep } from "core/common/transaction";

import { getRpcProvider } from "../../rpc";
import {
  MODES,
  SINGLE_TIP_MULTIPLIER,
  buildModernModes,
  multiply,
} from "./modes";

/**
 * Last resort for chains without `eth_feeHistory`, and for the rare moment a
 * node answers it with nothing usable.
 */
export async function getOnChainLegacy(chainId: number): Promise<GasPrices> {
  const provider = getRpcProvider(chainId);

  const [{ gasPrice, maxPriorityFeePerGas }, block] = await retry(
    () => Promise.all([provider.getFeeData(), provider.getBlock("latest")]),
    {
      retries: 2,
      minTimeout: 0,
      maxTimeout: 0,
    },
  );

  const baseFee = block?.baseFeePerGas ?? null;

  if (baseFee !== null && maxPriorityFeePerGas) {
    // `getFeeData()` caps at twice the base fee, which is double the head-room
    // the modes are meant to have, so they are shaped from the base fee itself
    const tips = {} as Record<FeeMode, bigint>;
    for (const mode of MODES) {
      tips[mode] = multiply(maxPriorityFeePerGas, SINGLE_TIP_MULTIPLIER[mode]);
    }

    return {
      type: "modern",
      modes: buildModernModes(baseFee, tips, gasPrice ?? null),
    };
  }

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
