import { FC } from "react";
import { useAtomValue } from "jotai";

import { cryptoCurrencyCodeAtom } from "app/atoms";
import Transak from "app/components/blocks/Transak";
import { TransakConfig, Environments } from "core/types/transak";

const BuyWithFiat: FC = () => {
  const currencyCode = useAtomValue(cryptoCurrencyCodeAtom);

  const config: TransakConfig = {
    apiKey: "69feba7f-a1c2-4cfa-a9bd-43072768b0e6",
    environment: Environments.STAGING,
    fiatCurrency: "USD",
    // fiatAmount: 100,
    widgetWidth: "500px",
    widgetHeight: "50vh",
    networks: [
      "ethereum",
      "polygon",
      "avaxcchain",
      "bnb",
      "fantom",
      "bsc",
      "celo",
      "arbitrum",
      "fuse",
      "moonriver",
      "optimism",
      "base",
      "linea",
    ],
  };

  if (currencyCode) {
    config["cryptoCurrencyCode"] = currencyCode;
  }

  return <Transak config={config} />;
};

export default BuyWithFiat;
