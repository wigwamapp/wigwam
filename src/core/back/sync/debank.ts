import axios from "axios";
import memoize from "mem";
import BigNumber from "bignumber.js";

import { DEBANK_CHAIN_LIST } from "fixtures/debankChainList";

export const debankOpenApi = axios.create({
  baseURL: "https://openapi.debank.com/v1",
  timeout: 60_000,
});

export const debankApi = axios.create({
  baseURL: "https://api.debank.com",
  timeout: 60_000,
});

export const getDebankChain = memoize(async (chainId: number) => {
  try {
    // const chainList = await getDebankChainList();

    return DEBANK_CHAIN_LIST.find((c: any) => c.community_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const getDebankChainList = memoize(
  async () => {
    const { data } = await debankOpenApi.get("/chain/list");
    return data;
  },
  {
    maxAge: 60 * 60_000, // 1 hour
  }
);

export const getDebankUserTokens = memoize(
  async (debankChainId: string, accountAddress: string) =>
    debankApi
      .get("/token/balance_list", {
        params: {
          user_addr: accountAddress,
          chain: debankChainId,
          is_all: false,
        },
      })
      .then(({ data }) => data?.data ?? []),
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 30_000, // 30 sec
  }
);

export const getDebankUserChainBalance = memoize(
  async (chainId: number, accountAddress: string) => {
    try {
      const debankChain = await getDebankChain(chainId);
      if (!debankChain) return null;

      const userTokens = await getDebankUserTokens(
        debankChain.id,
        accountAddress
      );

      let totalUSD = new BigNumber(0);

      for (const token of userTokens) {
        try {
          const balUSD = new BigNumber(token.balance)
            .div(new BigNumber(10).pow(token.decimals))
            .times(token.price);
          if (!balUSD.isNaN() && balUSD.isFinite()) {
            totalUSD = totalUSD.plus(balUSD);
          }
        } catch (err) {
          console.warn(err);
        }
      }

      return totalUSD.toString();

      // const { data } = await debankApi.get("/user/chain_balance", {
      //   params: {
      //     chain_id: debankChain.id,
      //     id: accountAddress,
      //   },
      // });

      // return data.usd_value.toString() as string;
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

export const getDebankUserNfts = async (
  debankChainId: string,
  accountAddress: string
) => {
  const res = await getDebankUserAllNfts(accountAddress).catch(() => null);

  return res?.data?.data.token_list.filter(
    (t: any) => t.chain === debankChainId
  );
};

const getDebankUserAllNfts = memoize(
  (accountAddress: string) =>
    debankApi.get("/nft/list", {
      params: {
        user_addr: accountAddress,
        is_collection: 1,
      },
    }),
  {
    maxAge: 40_000, // 40 sec
  }
);
