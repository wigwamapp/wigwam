import { Network } from "core/types";

export const FANTOM: Network[] = [
  // Mainnet
  {
    chainId: 250,
    type: "mainnet",
    rpcUrls: [
      "https://rpcapi.fantom.network",
      "https://1rpc.io/ftm",
      "https://rpc.fantom.network",
      "https://public.1rpc.io/ftm",
      "https://fantom.drpc.org",
      "https://fantom.api.pocket.network",
      "https://fantom.api.onfinality.io/public",
      "https://api.zan.top/ftm-mainnet",
    ],
    chainTag: "fantom",
    name: "Fantom Opera",
    nativeCurrency: {
      symbol: "FTM",
      name: "Fantom",
      decimals: 18,
    },
    explorerUrls: ["https://ftmscan.com"],
    faucetUrls: [],
    infoUrl: "https://fantom.foundation",
  },
];
