import { Network } from "core/types";

export const AURORA: Network[] = [
  // Mainnet
  {
    chainId: 1313161554,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.aurora.dev",
      "https://public.1rpc.io/aurora",
      "https://aurora.drpc.org",
      "https://aurora-mainnet.gateway.tatum.io",
    ],
    chainTag: "aurora",
    name: "Aurora",
    nativeCurrency: {
      symbol: "AETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://aurorascan.dev"],
    explorerApiUrl: "https://explorer.aurora.dev/api",
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://aurora.dev",
  },
];
