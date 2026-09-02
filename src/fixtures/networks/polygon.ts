import { Network } from "core/types";

export const POLYGON: Network[] = [
  // Mainnet
  {
    chainId: 137,
    type: "mainnet",
    rpcUrls: [
      "https://polygon.drpc.org",
      "https://1rpc.io/matic",
      "https://public.1rpc.io/matic",
      "https://polygon-bor-rpc.publicnode.com",
      "https://poly.api.pocket.network",
      "https://api.zan.top/polygon-mainnet",
      "https://rpc.private.mev-x.com/polygon",
      "https://matic.rpc.sentio.xyz",
    ],
    chainTag: "polygon",
    name: "Polygon",
    nativeCurrency: {
      symbol: "POL",
      name: "POL (ex-MATIC)",
      decimals: 18,
    },
    explorerUrls: ["https://polygonscan.com"],
    explorerApiUrl: "https://polygon.blockscout.com/api",
    faucetUrls: [],
    infoUrl: "https://polygon.technology/",
  },
];
