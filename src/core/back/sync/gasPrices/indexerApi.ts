import { GasPrices } from "core/types";

import { indexerApi } from "../indexer";

export async function getIndexerGasPrices(chainId: number): Promise<GasPrices> {
  const { data } = await indexerApi.get<GasPrices>(`/gasprices/${chainId}`, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  return data;
}
