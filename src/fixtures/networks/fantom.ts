import { Network } from "core/types";

export const FANTOM: Network[] = [
  // Mainnet
  {
    chainId: 250,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.ankr.com/fantom",
      "https://rpcapi.fantom.network",
      "https://1rpc.io/ftm",
      "https://rpc.ftm.tools",
      "https://rpc.fantom.network",
      "https://fantom-mainnet.public.blastapi.io",
    ],
    chainTag: "fantom",
    name: "Fantom Opera",
    nativeCurrency: {
      symbol: "FTM",
      name: "Fantom",
      decimals: 18,
    },
    explorerUrls: ["https://ftmscan.com"],
    explorerApiUrl: "https://api.ftmscan.com/api",
    faucetUrls: [],
    infoUrl: "https://fantom.foundation",
  },
];
