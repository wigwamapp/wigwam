import axios from "axios";
import { getAddress } from "ethers";
import memoize from "mem";
import { withOfflineCache } from "lib/ext/offlineCache";

import {
  createERC20TokenSlug,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
import type { RampTokenInfo } from "core/types";

import { getDexPrices, getCoinGeckoNativeTokenPrice } from "./dexPrices";

const ONE_DAY = 24 * 60 * 60_000;
const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

const onRampApi = axios.create({
  baseURL: process.env.WIGWAM_ON_RAMP_API_URL!,
  timeout: 90_000,
});

export const getOnRampCryptoCurrencies = memoize(
  async () => {
    const rampCurrencies = await getOnRampTokens();

    const erc20Addresses = Object.values(rampCurrencies)
      .filter((c) => c.slug !== NATIVE_TOKEN_SLUG)
      .map((c) => parseTokenSlug(c.slug).address);

    const erc20Prices = await getDexPrices(erc20Addresses);

    const result: Record<string, RampTokenInfo> = {};

    for (const [coinId, coin] of Object.entries(rampCurrencies)) {
      if (coin.slug === NATIVE_TOKEN_SLUG) {
        const price = await getCoinGeckoNativeTokenPrice(+coin.chainId);

        result[coinId] = {
          ...coin,
          priceUsd: price?.usd,
          priceUsdChange: price?.usd_24h_change,
        };
      } else {
        const price = erc20Prices[parseTokenSlug(coin.slug).address];

        result[coinId] = {
          ...coin,
          priceUsd: price?.usd,
          priceUsdChange: price?.usd_24h_change,
        };
      }
    }

    return result;
  },
  {
    maxAge: 3 * 60_000, // 3 min
  },
);

const getOnRampTokens = withOfflineCache(
  async () => {
    const onRampCurrencies: Record<string, RampTokenInfo> = {};
    const {
      data: { response: tokens },
    } = await onRampApi.get("/currencies/crypto-currencies");

    for (const { network, uniqueId, address, image, symbol, name } of tokens) {
      // Filter tokens
      if (
        // Empty token
        (!address && !network.chainId) ||
        // Non-ERC20 token
        (address !== NATIVE_TOKEN_ADDRESS && !network.chainId)
      ) {
        continue;
      }

      const slug =
        address === NATIVE_TOKEN_ADDRESS || !address
          ? NATIVE_TOKEN_SLUG
          : createERC20TokenSlug(getAddress(address));
      const coinId = `${network.chainId}_${slug}`;

      onRampCurrencies[coinId] = {
        id: uniqueId,
        name,
        slug,
        chainId: network.chainId,
        network: network.name,
        image: image.large,
        symbol,
      };
    }

    return onRampCurrencies;
  },
  {
    key: "onramp_tokens",
    hotMaxAge: 5_000,
    coldMaxAge: ONE_DAY,
  },
);
