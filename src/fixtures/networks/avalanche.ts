import { Network } from "core/types";

export const AVALANCHE: Network[] = [
  // Mainnet
  {
    chainId: 43114,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.ankr.com/avalanche",
      "https://api.avax.network/ext/bc/C/rpc",
      "https://1rpc.io/avax/c",
      "https://avalanche-c-chain.publicnode.com	",
      "https://endpoints.omniatech.io/v1/avax/mainnet/public",
      "https://avax.meowrpc.com",
      "https://avalanche.drpc.org",
    ],
    chainTag: "avalanche",
    name: "Avalanche",
    nativeCurrency: {
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
    },
    explorerUrls: [
      "https://snowtrace.io",
      "https://cchain.explorer.avax.network",
    ],
    explorerApiUrl: "https://api.snowtrace.io/api",
    faucetUrls: [],
    infoUrl: "https://www.avax.network/",
  },
];
