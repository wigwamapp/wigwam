import { suggestFees as suggestFeesPrimitive } from "lib/eip1559-fee";
import memoize from "mem";
import retry from "async-retry";

import { GasPrices } from "core/types";

import { RpcProvider, getRpcProvider } from "../../rpc";

export async function getOnChainEIP1559(chainId: number): Promise<GasPrices> {
  // Skip Arbitrum
  // TODO: Add other mechanic for this issue.
  if (chainId === 42161) return null;

  const provider = getRpcProvider(chainId);

  const eip1559 = await supportsEIP1559(provider);
  if (!eip1559) return null;

  const base = await suggestFeesPrimitive(provider).catch((err) => {
    console.error(err);
    return null;
  });
  if (!base) return null;

  const {
    baseFeeSuggestion,
    blocksToConfirmationByBaseFee,
    maxPriorityFeeSuggestions,
  } = base;

  const lowBaseFee = BigInt(blocksToConfirmationByBaseFee[8]);
  const averageBaseFee = BigInt(baseFeeSuggestion);
  const highBaseFee = (averageBaseFee * 21n) / 20n; // x 1.05

  const lowPriorityFee = BigInt(maxPriorityFeeSuggestions.normal);
  const averagePriorityFee = BigInt(maxPriorityFeeSuggestions.fast);
  const highPriorityFee = BigInt(maxPriorityFeeSuggestions.urgent);

  return {
    type: "modern",
    modes: {
      low: {
        max: (lowBaseFee + lowPriorityFee).toString(),
        priority: lowPriorityFee.toString(),
      },
      average: {
        max: (averageBaseFee + averagePriorityFee).toString(),
        priority: averagePriorityFee.toString(),
      },
      high: {
        max: (highBaseFee + highPriorityFee).toString(),
        priority: highPriorityFee.toString(),
      },
    },
  };
}

const supportsEIP1559 = memoize(
  async (provider: RpcProvider) => {
    try {
      const feeData = await retry(() => provider.getFeeData(), {
        retries: 2,
        minTimeout: 0,
        maxTimeout: 0,
      });

      return typeof feeData.maxPriorityFeePerGas === "bigint";
    } catch (err) {
      console.warn(err);
      return null;
    }
  },
  {
    cacheKey: ([p]) => p.chainId,
  },
);
