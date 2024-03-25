import { Network } from "core/types";

export const BASE: Network[] = [
  // Mainnet
  {
    chainId: 8453,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.base.org",
      "https://base.llamarpc.com",
      "https://1rpc.io/base",
      "https://base.meowrpc.com",
      "https://base.drpc.org",
      "https://base.publicnode.com",
      "https://endpoints.omniatech.io/v1/base/mainnet/public",
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
    explorerApiUrl: "https://api.basescan.org/api",
    faucetUrls: [],
    infoUrl: "https://base.org/",
  },
];
