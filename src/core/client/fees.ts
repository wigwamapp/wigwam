import { ethers } from "ethers";
import { suggestFees as suggestFeesPrimitive } from "@rainbow-me/fee-suggestions";

import { FeeSuggestions, FeesByModeModern } from "core/types";

import { ClientProvider } from "./provider";
import { getThirdPartyGasPrices } from "./wallet";

export async function suggestFees(
  provider: ClientProvider
): Promise<FeeSuggestions | null> {
  const base = await suggestFeesPrimitive(provider).catch(() => null);

  if (base) {
    const {
      baseFeeSuggestion,
      blocksToConfirmationByBaseFee,
      maxPriorityFeeSuggestions,
    } = base;

    const lowBaseFee = ethers.BigNumber.from(blocksToConfirmationByBaseFee[8]);
    const averageBaseFee = ethers.BigNumber.from(baseFeeSuggestion);
    const highBaseFee = averageBaseFee.mul(21).div(20); // x 1.05

    const lowPriorityFee = ethers.BigNumber.from(
      maxPriorityFeeSuggestions.normal
    );
    const averagePriorityFee = ethers.BigNumber.from(
      maxPriorityFeeSuggestions.fast
    );
    const highPriorityFee = ethers.BigNumber.from(
      maxPriorityFeeSuggestions.urgent
    );

    const modes: FeesByModeModern = {
      low: {
        max: lowBaseFee.add(lowPriorityFee),
        priority: lowPriorityFee,
      },
      average: {
        max: averageBaseFee.add(averagePriorityFee),
        priority: averagePriorityFee,
      },
      high: {
        max: highBaseFee.add(highPriorityFee),
        priority: highPriorityFee,
      },
    };

    return {
      type: "modern",
      modes,
      ...base,
    };
  }

  const tpGasPrices = await getThirdPartyGasPrices(provider.chainId);

  if (tpGasPrices) {
    const [low, average, high] = tpGasPrices.map((p) => ({
      max: ethers.BigNumber.from(p),
    }));

    return {
      type: "legacy",
      modes: { low, average, high },
    };
  }

  const chainGasPrice = await provider.getGasPrice();
  const step = 10 ** (chainGasPrice.lt(10 ** 9) ? 7 : 8);

  return {
    type: "legacy",
    modes: {
      low: { max: chainGasPrice.sub(step) },
      average: { max: chainGasPrice },
      high: { max: chainGasPrice.add(step) },
    },
  };
}
