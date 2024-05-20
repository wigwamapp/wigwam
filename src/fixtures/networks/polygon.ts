import { Network } from "core/types";

export const POLYGON: Network[] = [
  // Mainnet
  {
    chainId: 137,
    type: "mainnet",
    rpcUrls: [
      "https://polygon-rpc.com",
      "https://rpc.ankr.com/polygon",
      "https://endpoints.omniatech.io/v1/matic/mainnet/public",
      "https://polygon.llamarpc.com",
      "https://1rpc.io/matic",
      "https://polygon.drpc.org",
      "https://polygon.meowrpc.com",
    ],
    chainTag: "polygon",
    name: "Polygon",
    nativeCurrency: {
      symbol: "MATIC",
      name: "MATIC",
      decimals: 18,
    },
    explorerUrls: ["https://polygonscan.com"],
    explorerApiUrl: "https://api.polygonscan.com/api",
    faucetUrls: [],
    infoUrl: "https://polygon.technology/",
  },
];
