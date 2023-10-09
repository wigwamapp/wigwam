import BigNumber from "bignumber.js";

import { GasPrices } from "core/types";

import { getIndexerChain, indexerApi } from "../indexerApi";

export async function getIndexerGasPrices(chainId: number): Promise<GasPrices> {
  const indexerChain = await getIndexerChain(chainId);
  if (!indexerChain) return null;

  const res = await indexerApi
    .get("/chain/gas_price_dict_v2", {
      params: { chain: indexerChain.id },
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
