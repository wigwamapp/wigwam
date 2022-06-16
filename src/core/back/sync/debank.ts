import axios from "axios";
import memoize from "mem";

export const debankApi = axios.create({
  baseURL: "https://openapi.debank.com/v1",
  timeout: 60_000,
});

export const getDebankChain = memoize(async (chainId: number) => {
  try {
    const chainList = await getDebankChainList();
    return chainList.find((c: any) => c.community_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const getDebankChainList = memoize(
  async () => {
    const { data } = await debankApi.get("/chain/list");
    return data;
  },
  {
    maxAge: 60 * 60_000, // 1 hour
  }
);

export const getDebankUserChainBalance = memoize(
  async (chainId: number, accountAddress: string) => {
    try {
      const debankChain = await getDebankChain(chainId);
      if (!debankChain) return null;

      const { data } = await debankApi.get("/user/chain_balance", {
        params: {
          chain_id: debankChain.id,
          id: accountAddress,
        },
      });

      return data.usd_value.toString() as string;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 60_000, // 60 sec
  }
);
