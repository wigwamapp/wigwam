import { GasPrices } from "core/types";
import { getGasPriceStep } from "core/common/transaction";

import { getRpcProvider } from "../../rpc";

export async function getLineaGasPrices(chainId: number): Promise<GasPrices> {
  if (chainId !== 59144) return null;

  const provider = getRpcProvider(chainId);

  const data = await provider.send("linea_estimateGas", []);

  const gasLimit = BigInt(data.gasLimit);
  const maxPriorityFeePerGas = BigInt(data.priorityFeePerGas);
  const maxFeePerGas = BigInt(data.baseFeePerGas) + maxPriorityFeePerGas;

  const step = getGasPriceStep(maxFeePerGas);
  const priorityStep = getGasPriceStep(maxPriorityFeePerGas);

  return {
    type: "modern",
    gasLimit: gasLimit.toString(),
    modes: {
      low: {
        max: maxFeePerGas.toString(),
        priority: maxPriorityFeePerGas.toString(),
      },
      average: {
        max: (maxFeePerGas + step).toString(),
        priority: maxPriorityFeePerGas.toString(),
      },
      high: {
        max: (maxFeePerGas + step).toString(),
        priority: (maxPriorityFeePerGas + priorityStep).toString(),
      },
    },
  };
}
