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

  // Testnets
  {
    chainId: 256,
    type: "testnet",
    rpcUrls: ["https://http-testnet.hecochain.com"],
    chainTag: "heco",
    name: "Huobi ECO Chain Testnet",
    nativeCurrency: {
      symbol: "htt",
      name: "Huobi Test Token",
      decimals: 18,
    },
    explorerUrls: ["https://testnet.hecoinfo.com"],
    explorerApiUrl: "https://api-testnet.hecoinfo.com/api",
    faucetUrls: ["https://scan-testnet.hecochain.com/faucet"],
    infoUrl: "https://testnet.hecoinfo.com",
  },
];
