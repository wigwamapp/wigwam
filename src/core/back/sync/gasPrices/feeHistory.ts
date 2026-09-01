import retry from "async-retry";

import { FeeMode, GasPrices } from "core/types";

import { getRpcProvider } from "../../rpc";

/**
 * Standard EIP-1559 gas estimation via `eth_feeHistory`.
 *
 * Works on any chain that implements the method, which is nearly every evm
 * network. Chains that do not (rootstock, harmony) fall through to the legacy
 * `eth_gasPrice` path, and chains with a bespoke method (linea) are handled
 * before this one.
 */

/** More blocks smooth out single-block spikes, fewer keep it responsive */
const BLOCK_COUNT = 10;

/** Percentile of the priority fee paid in recent blocks, per mode */
const PERCENTILES: Record<FeeMode, number> = {
  low: 10,
  average: 50,
  high: 90,
};

/**
 * Head-room over the next base fee. A base fee may grow 12.5% per block, so
 * `high` survives ~6 blocks of continuous growth before the tx stalls.
 */
const BASE_FEE_MULTIPLIER: Record<FeeMode, [bigint, bigint]> = {
  low: [5n, 4n], // 1.25x
  average: [3n, 2n], // 1.5x
  high: [2n, 1n], // 2x
};

/**
 * Several L2s subsidise blocks, so recent tips are 0 and the base fee is 0,
 * which would produce an unmineable estimate. `eth_gasPrice` is the node's own
 * minimum, used here as a floor rather than as the estimate itself.
 */
const FLOOR_MULTIPLIER: Record<FeeMode, [bigint, bigint]> = {
  low: [1n, 1n],
  average: [5n, 4n],
  high: [3n, 2n],
};

const MODES = ["low", "average", "high"] as const;

export async function getFeeHistoryGasPrices(
  chainId: number,
): Promise<GasPrices> {
  const provider = getRpcProvider(chainId);

  const history = await retry(
    () =>
      provider.send("eth_feeHistory", [
        `0x${BLOCK_COUNT.toString(16)}`,
        "latest",
        MODES.map((mode) => PERCENTILES[mode]),
      ]),
    { retries: 2, minTimeout: 0, maxTimeout: 0 },
  );

  const baseFees = history?.baseFeePerGas;
  if (!Array.isArray(baseFees) || baseFees.length === 0) return null;

  // The array holds one entry more than the requested blocks:
  // the last one is the base fee of the block being built next
  const nextBaseFee = toBigInt(baseFees[baseFees.length - 1]);
  if (nextBaseFee === null) return null;

  const priorities = averagePriorities(history?.reward);
  // Without percentile data a priority fee cannot be guessed, and sending 0
  // would risk a tx that never gets mined. Let the legacy path answer.
  if (!priorities) return null;

  const floor = await getGasPriceFloor(chainId);
  const modes = {} as Record<FeeMode, { max: string; priority: string }>;

  for (const mode of MODES) {
    const [num, den] = BASE_FEE_MULTIPLIER[mode];

    let priority = priorities[mode];
    let max = (nextBaseFee * num) / den + priority;

    if (floor !== null) {
      const [floorNum, floorDen] = FLOOR_MULTIPLIER[mode];
      const minMax = (floor * floorNum) / floorDen;

      if (max < minMax) {
        max = minMax;
        // The tip has to cover whatever sits above the base fee, otherwise
        // raising `max` alone leaves the validator with no incentive
        if (max > nextBaseFee) priority = max - nextBaseFee;
      }
    }

    modes[mode] = { max: max.toString(), priority: priority.toString() };
  }

  // A chain reporting no base fee and no tips gives nothing to work with
  if (modes.high.max === "0") return null;

  return { type: "modern", modes };
}

/**
 * Mean priority fee per percentile across the sampled blocks.
 * Empty blocks report no rewards and are skipped rather than counted as 0.
 */
function averagePriorities(reward: unknown): Record<FeeMode, bigint> | null {
  if (!Array.isArray(reward) || reward.length === 0) return null;

  const sums = MODES.map(() => 0n);
  let counted = 0;

  for (const perBlock of reward) {
    if (!Array.isArray(perBlock) || perBlock.length < MODES.length) continue;

    const values = perBlock.slice(0, MODES.length).map(toBigInt);
    if (values.some((value) => value === null)) continue;

    values.forEach((value, i) => {
      sums[i] += value as bigint;
    });
    counted++;
  }

  if (counted === 0) return null;

  const result = {} as Record<FeeMode, bigint>;
  MODES.forEach((mode, i) => {
    result[mode] = sums[i] / BigInt(counted);
  });

  return result;
}

/** Best effort, a missing floor only means no clamping */
async function getGasPriceFloor(chainId: number): Promise<bigint | null> {
  try {
    const gasPrice = await getRpcProvider(chainId).send("eth_gasPrice", []);

    return toBigInt(gasPrice);
  } catch {
    return null;
  }
}

function toBigInt(value: unknown): bigint | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  try {
    const parsed = BigInt(value);
    return parsed >= 0n ? parsed : null;
  } catch {
    return null;
  }
}
