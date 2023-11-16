import axios, { AxiosError } from "axios";
import memoize from "mem";
import BigNumber from "bignumber.js";
import { storage } from "lib/ext/storage";

import { Setting } from "core/common";
import { U_INDEXER_CHAINS } from "fixtures/networks";

export const indexerApi = axios.create({
  baseURL: process.env.WIGWAM_INDEXER_API!,
  timeout: 120_000,
});

indexerApi.interceptors.request.use(async (config) => {
  if (config.params?._authAddress) {
    const authSig = await storage.fetchForce<string>(
      `authsig_${config.params._authAddress}`,
    );

    (config as any)._authAddress = config.params._authAddress;
    delete config.params._authAddress;

    if (authSig) config.headers["Auth-Signature"] = authSig;
  }

  return config;
});

indexerApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    console.warn(err);

    const res = err.response;

    if (res?.status === 401 && (res.config as any)._authAddress) {
      // TODO: enqueue
      const existing = await storage.fetchForce(Setting.RequiredAuthSig);
      const next = Array.from(
        new Set([...(existing ?? []), (res.config as any)._authAddress]),
      );
      await storage.put(Setting.RequiredAuthSig, next);
    }

    throw err;
  },
);

/**
 * C-Indexer = "Cx"
 */

export const getCxChain = memoize(async (chainId: number) => {
  try {
    const chainList = await fetchCxChainList();

    return chainList.find((c: any) => +c.chain_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const fetchCxChainList = memoize(
  () => indexerApi.get("/c/v1/chains/").then((r) => r.data?.data?.items ?? []),
  {
    maxAge: 60 * 60_000, // 1 hour
  },
);

/**
 * D-Indexer = "Dx"
 */
export const getDxChain = memoize(async (chainId: number) => {
  try {
    const chainList = await fetchDxChainList();

    return chainList.find((c: any) => c.community_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const fetchDxChainList = memoize(
  () => indexerApi.get("/d/v1/chain/list").then((r) => r.data),
  {
    maxAge: 60 * 60_000, // 1 hour
  },
);

/**
 * U-Indexer = "Ux"
 */

export const getUxChainName = (chainId: number) =>
  U_INDEXER_CHAINS.get(chainId);

export const getUserTokens = memoize(
  async (cChainName: string, accountAddress: string) =>
    indexerApi
      .get(`/c/v1/${cChainName}/address/${accountAddress}/balances_v2/`, {
        params: {
          _authAddress: accountAddress,
          "no-spam": true,
        },
      })
      .then(({ data }) => data?.data?.items || []),
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 30_000, // 30 sec
  },
);

export const getUserChainBalance = memoize(
  async (chainId: number, accountAddress: string) => {
    try {
      const cChainData = await getCxChain(chainId);
      if (!cChainData) return null;

      const userTokens = await getUserTokens(cChainData.name, accountAddress);

      let totalUSD = new BigNumber(0);

      for (const token of userTokens) {
        try {
          const balUSD = new BigNumber(token.quote);
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

export const getUserNfts = async (
  chainName: string,
  accountAddress: string,
) => {
  const { data } = await indexerApi.get(
    `/c/v1/${chainName}/address/${accountAddress}/balances_nft/`,
    {
      params: {
        _authAddress: accountAddress,
        "no-spam": true,
      },
    },
  );

  return (data?.data?.items ?? []).flatMap((item: any) =>
    item.nft_data.map((nftData: any) => ({
      ...item,
      nft_data: nftData,
    })),
  );
};
