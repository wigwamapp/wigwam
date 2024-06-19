import { Network } from "core/types";

export const MODE: Network[] = [
  // Mainnet
  {
    chainId: 34443,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.mode.network",
      "https://mode.drpc.org",
      "https://1rpc.io/mode",
    ],
    chainTag: "mode",
    name: "Mode",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.mode.network"],
    explorerApiUrl: "https://explorer.mode.network/api",
    infoUrl: "https://docs.mode.network",
    faucetUrls: [],
  },
];
