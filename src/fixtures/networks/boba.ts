import { Network } from "core/types";

export const BOBA: Network[] = [
  // Mainnet
  {
    chainId: 288,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.boba.network",
      "https://lightning-replica.boba.network",
    ],
    chainTag: "boba",
    name: "Boba Network",
    nativeCurrency: {
      symbol: "BOBA",
      name: "Boba Network",
      decimals: 18,
    },
    explorerUrls: ["https://blockexplorer.boba.network"],
    explorerApiUrl: "https://blockexplorer.boba.network/api",
    faucetUrls: [],
    infoUrl: "https://boba.network",
  },
];
