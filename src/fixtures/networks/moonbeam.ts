import { Network } from "core/types";

export const MOONBEAM: Network[] = [
  // Mainnet
  {
    chainId: 1284,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.api.moonbeam.network",
      "https://rpc.ankr.com/moonbeam",
      "https://moonbeam.public.blastapi.io",
    ],
    chainTag: "moonbeam",
    name: "Moonbeam",
    nativeCurrency: {
      symbol: "GLMR",
      name: "Glimmer",
      decimals: 18,
    },
    explorerUrls: ["https://moonbeam.moonscan.io"],
    explorerApiUrl: "https://api-moonbeam.moonscan.io/api",
    faucetUrls: [],
    infoUrl: "https://moonbeam.network/networks/moonbeam/",
  },

  // Testnets
  {
    chainId: 1287,
    type: "testnet",
    rpcUrls: [
      "https://rpc.testnet.moonbeam.network",
      "https://rpc.api.moonbase.moonbeam.network",
    ],
    chainTag: "moonbeam",
    name: "Moonbase Alpha",
    nativeCurrency: {
      symbol: "DEV",
      name: "Dev",
      decimals: 18,
    },
    explorerUrls: ["https://moonbase.moonscan.io"],
    explorerApiUrl: "https://api-moonbase.moonscan.io/api",
    faucetUrls: ["https://apps.moonbeam.network/moonbase-alpha/faucet/"],
    infoUrl: "https://docs.moonbeam.network/networks/testnet/",
  },
];
