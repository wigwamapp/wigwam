import { Network } from "core/types";

export const CELO: Network[] = [
  // Mainnet
  {
    chainId: 42220,
    type: "mainnet",
    rpcUrls: [
      "https://forno.celo.org",
      "https://rpc.ankr.com/celo",
      "https://1rpc.io/celo",
    ],
    chainTag: "celo",
    name: "Celo",
    nativeCurrency: {
      symbol: "CELO",
      name: "CELO",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.celo.org"],
    explorerApiUrl: "https://explorer.celo.org/api",
    faucetUrls: [],
    infoUrl: "https://docs.celo.org/",
  },
];
