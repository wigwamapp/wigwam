import retry from "async-retry";

import { FeeMode, GasPrices } from "core/types";

import { getRpcProvider } from "../../rpc";
import { MODES, TIP_PERCENTILES, buildModernModes } from "./modes";

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

export async function getFeeHistoryGasPrices(
  chainId: number,
): Promise<GasPrices> {
  const provider = getRpcProvider(chainId);

  const history = await retry(
    () =>
      provider.send("eth_feeHistory", [
        `0x${BLOCK_COUNT.toString(16)}`,
        "latest",
        MODES.map((mode) => TIP_PERCENTILES[mode]),
      ]),
    { retries: 2, minTimeout: 0, maxTimeout: 0 },
  );

  const baseFees = history?.baseFeePerGas;
  if (!Array.isArray(baseFees) || baseFees.length === 0) return null;

  // The array holds one entry more than the requested blocks:
  // the last one is the base fee of the block being built next
  const nextBaseFee = toBigInt(baseFees[baseFees.length - 1]);
  if (nextBaseFee === null) return null;

  const tips = medianTips(history?.reward);
  // Without percentile data a priority fee cannot be guessed, and sending 0
  // would risk a tx that never gets mined. Let the legacy path answer.
  if (!tips) return null;

  const floor = await getGasPriceFloor(chainId);
  const modes = buildModernModes(nextBaseFee, tips, floor);

  // A chain reporting no base fee and no tips gives nothing to work with
  if (modes.high.max === "0") return null;

  return { type: "modern", modes };
}

/**
 * Median tip per percentile across the sampled blocks.
 *
 * A median rather than a mean: a single block carrying an MEV bundle drags an
 * average far above what the next block will actually cost.
 */
function medianTips(reward: unknown): Record<FeeMode, bigint> | null {
  if (!Array.isArray(reward) || reward.length === 0) return null;

  const perMode = MODES.map(() => [] as bigint[]);

  for (const perBlock of reward) {
    if (!Array.isArray(perBlock) || perBlock.length < MODES.length) continue;

    const values = perBlock.slice(0, MODES.length).map(toBigInt);
    if (values.some((value) => value === null)) continue;

    values.forEach((value, i) => {
      perMode[i].push(value as bigint);
    });
  }

  // Empty blocks report no rewards and are skipped rather than counted as 0
  if (perMode[0].length === 0) return null;

  const result = {} as Record<FeeMode, bigint>;
  MODES.forEach((mode, i) => {
    result[mode] = median(perMode[i]);
  });

  return result;
}

/** Upper middle of an even sample: a hair too high beats a stuck transaction */
function median(values: bigint[]): bigint {
  const sorted = [...values].sort((a, b) => (a === b ? 0 : a < b ? -1 : 1));

  return sorted[sorted.length >> 1];
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
