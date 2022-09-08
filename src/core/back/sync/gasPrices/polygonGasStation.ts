import axios from "axios";
import BigNumber from "bignumber.js";

import { TPGasPrices } from "core/types";

const GAS_STATION_ENDPOINTS = new Map([
  [137, "https://gasstation-mainnet.matic.network/v2"],
  [80001, "https://gasstation-mumbai.matic.today/v2"],
]);

export async function getPolygonGasPrices(
  chainId: number
): Promise<TPGasPrices> {
  const url = GAS_STATION_ENDPOINTS.get(chainId);
  if (!url) return null;

  const res = await axios.get(url, { timeout: 60_000 });

  const { safeLow, standard, fast } = res.data;

  const [low, average, high] = [safeLow, standard, fast].map(
    ({ maxFee, maxPriorityFee }) => ({
      max: toGweiString(maxFee),
      priority: toGweiString(maxPriorityFee),
    })
  );

  return {
    type: "modern",
    modes: { low, average, high },
  };
}

function toGweiString(value: BigNumber.Value) {
  return new BigNumber(value)
    .times(10 ** 9)
    .integerValue()
    .toString();
}
