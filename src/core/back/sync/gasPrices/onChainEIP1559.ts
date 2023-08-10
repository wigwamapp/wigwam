import { ethers } from "ethers";
import { suggestFees as suggestFeesPrimitive } from "@rainbow-me/fee-suggestions";
import memoize from "mem";
import retry from "async-retry";

import { GasPrices } from "core/types";

import { RpcProvider, getRpcProvider } from "../../rpc";

export async function getOnChainEIP1559(chainId: number): Promise<GasPrices> {
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

  const lowBaseFee = ethers.BigNumber.from(blocksToConfirmationByBaseFee[8]);
  const averageBaseFee = ethers.BigNumber.from(baseFeeSuggestion);
  const highBaseFee = averageBaseFee.mul(21).div(20); // x 1.05

  const lowPriorityFee = ethers.BigNumber.from(
    maxPriorityFeeSuggestions.normal,
  );
  const averagePriorityFee = ethers.BigNumber.from(
    maxPriorityFeeSuggestions.fast,
  );
  const highPriorityFee = ethers.BigNumber.from(
    maxPriorityFeeSuggestions.urgent,
  );

  return {
    type: "modern",
    modes: {
      low: {
        max: lowBaseFee.add(lowPriorityFee).toString(),
        priority: lowPriorityFee.toString(),
      },
      average: {
        max: averageBaseFee.add(averagePriorityFee).toString(),
        priority: averagePriorityFee.toString(),
      },
      high: {
        max: highBaseFee.add(highPriorityFee).toString(),
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

      return ethers.BigNumber.isBigNumber(feeData.maxPriorityFeePerGas);
    } catch (err) {
      console.warn(err);
      return null;
    }
  },
  {
    cacheKey: ([p]) => p.network.chainId,
  },
);
