import axios, { AxiosError } from "axios";
import memoize from "mem";
import BigNumber from "bignumber.js";
import { storage } from "lib/ext/storage";

import { Setting } from "core/common/settings";

export const indexerApi = axios.create({
  baseURL: process.env.WIGWAM_INDEXER_API,
  timeout: 60_000,
});

indexerApi.interceptors.request.use(async (config) => {
  if (config.params?.id) {
    const authSig = await storage.fetchForce<string>(
      `authsig_${config.params.id}`,
    );

    if (authSig) config.headers["AuthSignature"] = authSig;
  }

  // Do something before request is sent
  return config;
});

indexerApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    console.warn(err);

    const res = err.response;

    if (res?.status === 401 && res.config.params?.id) {
      // TODO: enqueue
      const existing = await storage.fetchForce(Setting.RequiredAuthSig);
      const next = Array.from(
        new Set([...(existing ?? []), res.config.params.id]),
      );
      await storage.put(Setting.RequiredAuthSig, next);
    }

    throw err;
  },
);

export const getIndexerChain = memoize(async (chainId: number) => {
  try {
    const chainList = await getAllIndexerChains();

    return chainList.find((c: any) => c.community_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const getAllIndexerChains = memoize(
  async () => {
    const { data } = await indexerApi.get("/v1/chain/list");
    return data;
  },
  {
    maxAge: 60 * 60_000, // 1 hour
  },
);

export const getIndexerUserTokens = memoize(
  async (chainName: string, accountAddress: string) =>
    indexerApi
      .get("/v1/user/token_list", {
        params: {
          id: accountAddress,
          chain_id: chainName,
          is_all: false,
        },
      })
      .then(({ data }) => data || []),
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 30_000, // 30 sec
  },
);

export const getUserChainBalance = memoize(
  async (chainId: number, accountAddress: string) => {
    try {
      const chainData = await getIndexerChain(chainId);
      if (!chainData) return null;

      const userTokens = await getIndexerUserTokens(
        chainData.id,
        accountAddress,
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

      // const { data } = await indexerApi.get("/user/chain_balance", {
      //   params: {
      //     chain_id: chainData.id,
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
  },
);

export const getIndexerUserNfts = async (
  chainName: string,
  accountAddress: string,
) => {
  const { data } = await indexerApi.get("/v1/user/nft_list", {
    params: {
      chain_id: chainName,
      id: accountAddress,
    },
  });

  return data;
};
