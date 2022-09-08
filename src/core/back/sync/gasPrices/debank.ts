import BigNumber from "bignumber.js";

import { TPGasPrices } from "core/types";

import { getDebankChain, debankApi } from "../debank";

export async function getDebankGasPrices(
  chainId: number
): Promise<TPGasPrices> {
  const debankChain = await getDebankChain(chainId);
  if (!debankChain) return null;

  const res = await debankApi
    .get<any[]>("/wallet/gas_market", {
      params: { chain_id: debankChain.id },
    })
    .catch(() => null);
  if (!res?.data) return null;

  const [low, average, high] = res.data.map((v) => ({
    max: new BigNumber(v.price).toString(),
  }));

  return {
    type: "legacy",
    modes: { low, average, high },
  };
}
