import { FeeMode } from "core/types";

/**
 * Shaping of the three fee modes, shared by every estimation way.
 *
 * What a gas tracker (etherscan, polygonscan) shows is the price a tx is
 * expected to actually pay: `base fee + tip`. What a wallet has to send is a
 * cap, `maxFeePerGas`, and the difference between the cap and the real base
 * fee is refunded. So a cap is always above the tracker, and the multipliers
 * below only decide by how much — they are head-room, not a surcharge.
 *
 * The numbers match MetaMask's own fee-history estimator, which is what the
 * trackers are usually compared against.
 */

export const MODES = ["low", "average", "high"] as const;

/**
 * Percentile of the tips paid in recent blocks, per mode. A base fee may only
 * grow 12.5% per block, so the tip is what actually orders transactions and
 * these stay low: the p90 of a block with MEV bundles in it is not a price
 * anyone needs to pay to get mined.
 */
export const TIP_PERCENTILES: Record<FeeMode, number> = {
  low: 10,
  average: 20,
  high: 30,
};

/** Head-room over the base fee of the next block */
export const BASE_FEE_MULTIPLIER: Record<FeeMode, [bigint, bigint]> = {
  low: [11n, 10n], // 1.10x
  average: [6n, 5n], // 1.20x
  high: [5n, 4n], // 1.25x
};

/**
 * Several L2s subsidise blocks, so recent tips are 0 and the base fee is 0,
 * which would produce an unmineable estimate. `eth_gasPrice` is the node's own
 * minimum, used as a floor rather than as the estimate itself.
 */
export const FLOOR_MULTIPLIER: Record<FeeMode, [bigint, bigint]> = {
  low: [1n, 1n], // 1x
  average: [11n, 10n], // 1.1x
  high: [6n, 5n], // 1.2x
};

/**
 * Spread for the ways that can only obtain a single tip instead of a
 * percentile per mode. Without it every mode would collapse into one value on
 * chains where the tip, and not the base fee, is what a sender competes with.
 */
export const SINGLE_TIP_MULTIPLIER: Record<FeeMode, [bigint, bigint]> = {
  low: [1n, 1n], // 1x
  average: [11n, 10n], // 1.1x
  high: [5n, 4n], // 1.25x
};

export function multiply(value: bigint, [num, den]: [bigint, bigint]) {
  return (value * num) / den;
}

/**
 * Turns a base fee and a tip per mode into the `maxFeePerGas` caps to send.
 *
 * @param baseFee - Base fee of the block being built next
 * @param tips - Priority fee per mode
 * @param floor - `eth_gasPrice`, when known, as the lowest price the node itself
 * would suggest
 */
export function buildModernModes(
  baseFee: bigint,
  tips: Record<FeeMode, bigint>,
  floor: bigint | null,
) {
  const modes = {} as Record<FeeMode, { max: string; priority: string }>;

  for (const mode of MODES) {
    let priority = tips[mode];
    let max = multiply(baseFee, BASE_FEE_MULTIPLIER[mode]) + priority;

    if (floor !== null) {
      const minMax = multiply(floor, FLOOR_MULTIPLIER[mode]);

      if (max < minMax) {
        max = minMax;
        // The tip has to cover whatever sits above the base fee, otherwise
        // raising `max` alone leaves the validator with no incentive
        if (max > baseFee) priority = max - baseFee;
      }
    }

    modes[mode] = { max: max.toString(), priority: priority.toString() };
  }

  return modes;
}
