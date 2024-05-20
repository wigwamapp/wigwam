import { Network } from "core/types";

export const HECO: Network[] = [
  // Mainnet
  {
    chainId: 128,
    type: "mainnet",
    rpcUrls: ["https://http-mainnet.hecochain.com"],
    chainTag: "heco",
    name: "Huobi ECO Chain",
    nativeCurrency: {
      symbol: "HT",
      name: "Huobi Token",
      decimals: 18,
    },
    explorerUrls: ["https://hecoinfo.com"],
    explorerApiUrl: "https://api.hecoinfo.com/api",
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://www.hecochain.com",
  },
];
