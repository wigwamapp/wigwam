import { Network } from "core/types";

export const AVALANCHE: Network[] = [
  // Mainnet
  {
    chainId: 43114,
    type: "mainnet",
    rpcUrls: [
      "https://api.avax.network/ext/bc/C/rpc",
      "https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc",
      "https://rpc.ankr.com/avalanche",
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

  // Testnets
  {
    chainId: 43113,
    type: "testnet",
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    chainTag: "avalanche",
    name: "Avalanche Testnet Fuji",
    nativeCurrency: {
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
    },
    explorerUrls: ["https://testnet.snowtrace.io"],
    explorerApiUrl: "https://api-testnet.snowtrace.io/api",
    faucetUrls: ["https://faucet.avax-test.network/"],
    infoUrl: "https://cchain.explorer.avax-test.network",
  },
];
