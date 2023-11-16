import BigNumber from "bignumber.js";

import { GasPrices } from "core/types";

import { getDxChain, indexerApi } from "../indexerApi";

export async function getIndexerGasPrices(chainId: number): Promise<GasPrices> {
  const dxChain = await getDxChain(chainId);
  if (!dxChain) return null;

  const res = await indexerApi
    .get("/d/v1/wallet/gas_market", {
      params: { chain_id: dxChain.id },
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
