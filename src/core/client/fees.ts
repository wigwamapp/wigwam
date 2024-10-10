import { FeeSuggestions } from "core/types";

import { getGasPrices } from "./wallet";
import { ClientProvider } from "./provider";

export async function suggestFees(
  provider: ClientProvider,
): Promise<FeeSuggestions> {
  const gasPrices = await getGasPrices(provider.chainId);

  if (!gasPrices) {
    throw new Error("Failed to estimate gas prices.");
  }

  return {
    type: gasPrices.type,
    gasLimit: gasPrices.gasLimit ? BigInt(gasPrices.gasLimit) : undefined,
    modes: Object.fromEntries(
      Object.entries(gasPrices.modes).map(([mode, fees]) => [
        mode,
        Object.fromEntries(
          Object.entries(fees).map(([prop, price]) => [prop, BigInt(price)]),
        ),
      ]),
    ) as any,
  };
}
