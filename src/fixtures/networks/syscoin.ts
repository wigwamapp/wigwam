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
];
