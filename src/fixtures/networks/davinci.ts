import { Network } from "core/types";

export const DAVINCI: Network[] = [
  // Mainnet
  {
    chainId: 293,
    type: "mainnet",
    rpcUrls: ["https://rpc.davinci.bz"],
    chainTag: "davinci",
    name: "DaVinci Network",
    nativeCurrency: {
      symbol: "DCOIN",
      name: "DaVinci",
      decimals: 18,
    },
    explorerUrls: [
      "https://mainnet-explorer.davinci.bz",
      "https://validator-explorer.davinci.bz",
    ],
    explorerApiUrl: "https://mainnet-explorer.davinci.bz/api",
    faucetUrls: [],
    infoUrl: "https://davinci.bz",
  },
];
