import axios from "axios";
import memoize from "mem";
import ExpiryMap from "expiry-map";
import { getAddress, isAddress } from "ethers";
import { withOfflineCache } from "lib/ext/offlineCache";

export type CGPriceRecord = { usd: number; usd_24h_change?: number };
export type CoinGeckoPrices = Record<string, CGPriceRecord>;

const THREE_MIN = 3 * 60_000;
const ONE_DAY = 24 * 60 * 60_000;

export const coinGeckoApi = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 90_000,
});

export const coinGeckoTerminalApi = axios.create({
  baseURL: "https://api.geckoterminal.com/api/v2",
  timeout: 90_000,
});

const tokenPricesCache = new ExpiryMap<string, CGPriceRecord>(THREE_MIN);

export async function getCoinGeckoPrices(
  chainId: number,
  tokenAddresses: string[],
) {
  try {
    if (tokenAddresses.length === 0) return {};
    if (tokenAddresses.length > 1000) return {}; // To much

    const allCoinIds = await getCoinGeckoCoinIds();

    const data: CoinGeckoPrices = {};
    const tokensToRefresh: { tokenAddress: string; coinId: string }[] = [];
    const coinsToRefreshSet = new Set<string>();
    const missedAddresses = new Set<string>();

    for (const tokenAddress of tokenAddresses) {
      const coinId = allCoinIds[tokenAddress.toLowerCase()];
      const cached = tokenPricesCache.get(coinId ?? tokenAddress);

      if (cached) {
        data[tokenAddress] = cached;
        continue;
      }

      if (coinId) {
        tokensToRefresh.push({ tokenAddress, coinId });
        coinsToRefreshSet.add(coinId);
      } else {
        missedAddresses.add(tokenAddress);
      }
    }

    // Coin gecko - simple
    if (coinsToRefreshSet.size > 0) {
      const freshCoinPrices: CoinGeckoPrices = {};
      const coinsToRefresh = Array.from(coinsToRefreshSet);

      while (coinsToRefresh.length > 0) {
        const nextCoins = coinsToRefresh.splice(0, 100);

        const res = await coinGeckoApi
          .get<CoinGeckoPrices>("/simple/price", {
            params: {
              ids: nextCoins.join(),
              vs_currencies: "USD",
              include_24hr_change: true,
            },
          })
          .catch(() => null);

        if (!res) continue;

        Object.assign(freshCoinPrices, res.data);
      }

      // Cache new prices
      for (const coinId in freshCoinPrices) {
        tokenPricesCache.set(coinId, freshCoinPrices[coinId]);
      }

      // Update data to return
      for (const { tokenAddress, coinId } of tokensToRefresh) {
        const prices = freshCoinPrices[coinId];
        if (prices) data[tokenAddress] = prices;
      }
    }

    // Coin gecko terminal - simple
    if (missedAddresses.size > 0 && missedAddresses.size <= 150) {
      const cgtNetworkIds = await getCoinGeckoTerminalNetworkIds();
      const networkName = cgtNetworkIds[chainId];

      if (networkName) {
        const addressesToRefresh = Array.from(missedAddresses);

        while (addressesToRefresh.length > 0) {
          const nextAddresses = addressesToRefresh.splice(0, 30);

          const res = await coinGeckoTerminalApi
            .get(
              `/simple/networks/${networkName}/token_price/${nextAddresses.join()}`,
            )
            .catch(() => null);

          const cgtTokenPrices = res?.data?.data?.attributes?.token_prices;
          if (!cgtTokenPrices) continue;

          for (const tokenAddressLowerCased in cgtTokenPrices) {
            const tokenAddress = getAddress(tokenAddressLowerCased);
            const usdPrice = +cgtTokenPrices[tokenAddressLowerCased];
            if (!usdPrice) continue;

            const prices = { usd: usdPrice };
            data[tokenAddress] = prices;
            tokenPricesCache.set(tokenAddress, prices);
          }
        }
      }
    }

    return data;
  } catch (err) {
    console.error(err);
    return {};
  }
}

export const getCoinGeckoNativeTokenPrice = async (chainId: number) => {
  try {
    const platformIds = await getCoinGeckoPlatformIds();

    const nativeCoinId = platformIds[chainId]?.native_coin_id;
    if (!nativeCoinId) return null;

    const prices = await getCoinGeckoPlatformPrices();

    return nativeCoinId in prices ? prices[nativeCoinId] : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getCoinGeckoPlatformPrices = memoize(
  async () => {
    const platformIds = await getCoinGeckoPlatformIds();

    const { data } = await coinGeckoApi.get<CoinGeckoPrices>("/simple/price", {
      params: {
        ids: Object.values(platformIds)
          .map((p) => p.native_coin_id)
          .join(),
        vs_currencies: "USD",
        include_24hr_change: true,
      },
    });

    return data;
  },
  {
    maxAge: THREE_MIN, // 3 min
  },
);

export const getCoinGeckoCoinIds = withOfflineCache(
  async () => {
    const { data } = await coinGeckoApi.get("/coins/list", {
      params: { include_platform: true },
    });

    const allCoinIds: Record<string, string> = {};

    for (const item of data) {
      for (const tokenAddress of Object.values(item.platforms) as string[]) {
        try {
          if (isAddress(tokenAddress)) allCoinIds[tokenAddress] = item.id;
        } catch {}
      }
    }

    return allCoinIds;
  },
  {
    key: "cg_coins_list",
    hotMaxAge: 5_000,
    coldMaxAge: ONE_DAY,
  },
);

export const getCoinGeckoTerminalNetworkIds = withOfflineCache(
  async () => {
    const platformIds = await getCoinGeckoPlatformIds();

    const reversePlatformIds: Record<string, number> = {};
    for (const chainId in platformIds) {
      reversePlatformIds[platformIds[chainId].id] = +chainId;
    }

    const cgtNetworkIds: Record<number, string> = {};

    let page = 1;
    while (true) {
      const { data } = await coinGeckoTerminalApi.get("/networks", {
        params: { page },
      });

      for (const item of data.data) {
        const cgPlatformId = item.attributes.coingecko_asset_platform_id;
        if (!cgPlatformId) continue;

        const chainId = reversePlatformIds[cgPlatformId];
        if (!chainId) continue;

        cgtNetworkIds[chainId] = item.id;
      }

      if (!data.links.next || page > 4) break;
      page++;
    }

    return cgtNetworkIds;
  },
  {
    key: "cgt_networks",
    hotMaxAge: 5_000,
    coldMaxAge: ONE_DAY,
  },
);

export const getCoinGeckoPlatformIds = withOfflineCache(
  async () => {
    const { data } = await coinGeckoApi.get("/asset_platforms");

    const platformIds: Record<number, { id: string; native_coin_id: string }> =
      {};

    for (const { id, chain_identifier, native_coin_id } of data) {
      if (id && chain_identifier && typeof chain_identifier === "number") {
        platformIds[chain_identifier] = { id, native_coin_id };
      }
    }

    return platformIds;
  },
  {
    key: "cg_asset_platforms",
    hotMaxAge: 5_000,
    coldMaxAge: ONE_DAY,
  },
);
