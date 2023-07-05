import axios from "axios";
import memoize from "mem";
import BigNumber from "bignumber.js";
// import browser from "webextension-polyfill";
// import { createOrganicThrottle } from "lib/system/organicThrottle";

import { DEBANK_CHAIN_LIST } from "fixtures/debankChainList";

export const debankOpenApi = axios.create({
  baseURL: "https://openapi.debank.com/v1",
  timeout: 60_000,
});

export const debankApi = axios.create({
  baseURL: "https://api.debank.com",
  timeout: 60_000,
});

debankApi.interceptors.response.use(
  (res) => {
    if (res.data?.error_code === 1) {
      throw new Error(res.data.error_msg ?? "Unknown error");
    }

    return res;
  }
  // async (err) => {
  //   if (err?.response?.status === 429) {
  //     const reallyOpened = await openDebankWebsite();

  //     if (reallyOpened) {
  //       const { method, url, params } = err.config;
  //       return debankApi({ method, url, params });
  //     }
  //   }

  //   throw err;
  // }
);

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

// const dbwThrottle = createOrganicThrottle();
// let dbwLastOpened: number | undefined;

// function openDebankWebsite() {
//   return dbwThrottle(async () => {
//     if (dbwLastOpened && dbwLastOpened > Date.now() - 60_000 * 2) {
//       return false;
//     }

//     const win = await browser.windows
//       .create({
//         type: "popup",
//         url: "https://debank.com",
//         width: 1,
//         height: 1,
//         top: 0,
//         left: 0,
//         focused: false,
//       })
//       .catch(() => null);

//     if (win?.id !== undefined) {
//       await new Promise((r) => setTimeout(r, 2_500));
//       await browser.windows.remove(win.id).catch(() => null);
//     }

//     dbwLastOpened = Date.now();

//     return true;
//   });
// }
