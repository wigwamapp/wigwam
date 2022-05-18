import BigNumber from "bignumber.js";
import memoize from "mem";
import { storage } from "lib/ext/storage";

import { CONVERSION_CURRENCIES } from "fixtures/conversionCurrency";

import { coinGeckoApi } from "./coinGecko";

export type Currency = {
  name: string;
  type: string;
  unit: string;
  value: number;
};

export const syncConversionRates = memoize(
  async () => {
    try {
      const { data } = await coinGeckoApi.get("/exchange_rates");
      const currencies: { rates: Record<string, Currency> } = data;

      const rates: Record<string, string> = {};

      const btcPrice = new BigNumber(currencies.rates["usd"].value);
      const btcToUsd = new BigNumber(1).dividedBy(btcPrice);
      Object.entries(currencies.rates).forEach(([key, value]) => {
        if (value.type === "fiat" || key === "btc" || key === "eth") {
          if (value.name === "Russian Ruble") {
            return;
          }
          const code = CONVERSION_CURRENCIES.find(
            (conv_curr) => conv_curr.code === key.toUpperCase()
          )?.code;
          if (code) {
            const convertedAmount = new BigNumber(value.value).multipliedBy(
              btcToUsd
            );
            rates[code] = convertedAmount.toString();
          }
        }
      });

      await storage.put("currencies_rate", rates);
    } catch (err) {
      console.error(err);
    }
  },
  { maxAge: 300000 }
);
