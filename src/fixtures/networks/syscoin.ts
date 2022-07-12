import { Network } from "core/types";

export const SYSCOIN: Network[] = [
  // Mainnet
  {
    chainId: 57,
    type: "mainnet",
    rpcUrls: ["https://rpc.syscoin.org", "https://rpc.ankr.com/syscoin"],
    chainTag: "syscoin",
    name: "Syscoin",
    nativeCurrency: {
      symbol: "SYS",
      name: "Syscoin",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.syscoin.org"],
    explorerApiUrl: "https://explorer.syscoin.org/api",
    faucetUrls: [],
    infoUrl: "https://www.syscoin.org",
  },

  // Testnets
  {
    chainId: 5700,
    type: "testnet",
    rpcUrls: ["https://rpc.tanenbaum.io"],
    chainTag: "syscoin",
    name: "Syscoin Tanenbaum Testnet",
    nativeCurrency: {
      symbol: "tSYS",
      name: "Test Syscoin",
      decimals: 18,
    },
    explorerUrls: ["https://tanenbaum.io"],
    explorerApiUrl: "https://tanenbaum.io/api",
    faucetUrls: ["https://faucet.tanenbaum.io"],
    infoUrl: "https://syscoin.org",
  },
];
