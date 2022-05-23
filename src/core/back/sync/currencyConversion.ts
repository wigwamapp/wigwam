import BigNumber from "bignumber.js";
import memoize from "mem";
import { storage } from "lib/ext/storage";

import { CONVERSION_CURRENCIES } from "fixtures/conversionCurrency";

import { coinGeckoApi } from "./coinGecko";

type CoinGeckoRate = {
  name: string;
  type: string;
  unit: string;
  value: number;
};

export const syncConversionRates = memoize(
  async () => {
    try {
      const { data } = await coinGeckoApi.get("/exchange_rates");
      const geckoRates: Record<string, CoinGeckoRate> = data.rates;

      if (!geckoRates["usd"]) return;

      const btcPrice = new BigNumber(geckoRates["usd"].value);
      const btcToUsd = new BigNumber(1).dividedBy(btcPrice);

      const rates: Record<string, string> = {};

      for (const { code } of CONVERSION_CURRENCIES) {
        const geckoRate = geckoRates[code.toLowerCase()];

        if (geckoRate) {
          rates[code] = new BigNumber(geckoRate.value)
            .times(btcToUsd)
            .toString();
        }
      }

      await storage.put("currencies_rate", rates);
    } catch (err) {
      console.error(err);
    }
  },
  { maxAge: 5 * 60_000 }
);
