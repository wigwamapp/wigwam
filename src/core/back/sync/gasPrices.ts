import BigNumber from "bignumber.js";
import memoize from "mem";

import { debankApi, getDebankChain } from "./debank";

export const getTPGasPrices = memoize(
  async (chainId: number) => {
    try {
      const debankChain = await getDebankChain(chainId);
      if (!debankChain) return null;

      const res = await debankApi
        .get<any[]>("/wallet/gas_market", {
          params: { chain_id: debankChain.id },
        })
        .catch(() => null);
      if (!res?.data) return null;

      const [slow, normal, fast] = res.data.map((v) =>
        new BigNumber(v.price).toString()
      );

      return [slow, normal, fast] as const;
    } catch (err) {
      console.warn(err);
      return null;
    }
  },
  {
    maxAge: 60_000,
  }
);
