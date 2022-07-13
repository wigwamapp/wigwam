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

  // Testnets
  {
    chainId: 28,
    type: "testnet",
    rpcUrls: ["https://rinkeby.boba.network/"],
    chainTag: "boba",
    name: "Boba Rinkeby Testnet",
    nativeCurrency: {
      symbol: "tBOBA",
      name: "Test Boba",
      decimals: 18,
    },
    explorerUrls: ["https://blockexplorer.rinkeby.boba.network"],
    explorerApiUrl: "https://blockexplorer.rinkeby.boba.network/api",
    faucetUrls: ["https://faucet.rinkeby.io"],
    infoUrl: "https://boba.network",
  },
];
