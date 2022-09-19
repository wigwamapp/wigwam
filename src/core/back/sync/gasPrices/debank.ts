import BigNumber from "bignumber.js";

import { TPGasPrices } from "core/types";

import { getDebankChain, debankApi } from "../debank";

export async function getDebankGasPrices(
  chainId: number
): Promise<TPGasPrices> {
  const debankChain = await getDebankChain(chainId);
  if (!debankChain) return null;

  const res = await debankApi
    .get("/chain/gas_price_dict_v2", {
      params: { chain: debankChain.id },
    })
    .catch(() => null);

  const data = res?.data?.data;
  if (!data) return null;

  const { slow, normal, fast } = data;

  const [low, average, high] = [slow, normal, fast].map((v) => ({
    max: new BigNumber(v.price).toString(),
  }));

  return {
    type: "legacy",
    modes: { low, average, high },
  };
}
