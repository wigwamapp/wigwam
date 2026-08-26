import { Network } from "core/types";

export const BASE: Network[] = [
  // Mainnet
  {
    chainId: 8453,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.base.org",
      "https://1rpc.io/base",
      "https://base.meowrpc.com",
      "https://base.drpc.org",
      "https://base.publicnode.com",
      "https://public.1rpc.io/base",
      "https://base-rpc.publicnode.com",
      "https://base.api.pocket.network",
    ],
    chainTag: "base",
    name: "Base",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: [
      "https://basescan.org",
      "https://base.blockscout.com",
      "https://base.dex.guru",
    ],
    explorerApiUrl: "https://base.blockscout.com/api",
    faucetUrls: [],
    infoUrl: "https://base.org/",
  },
];
