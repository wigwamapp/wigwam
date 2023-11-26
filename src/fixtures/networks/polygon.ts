import { Network } from "core/types";

export const POLYGON: Network[] = [
  // Mainnet
  {
    chainId: 137,
    type: "mainnet",
    rpcUrls: [
      "https://polygon.llamarpc.com",
      "https://polygon-rpc.com",
      "https://endpoints.omniatech.io/v1/matic/mainnet/public",
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

  // Testnets
  {
    chainId: 80001,
    type: "testnet",
    rpcUrls: [
      "https://rpc-mumbai.maticvigil.com",
      "https://endpoints.omniatech.io/v1/matic/mumbai/public",
      "https://polygon-mumbai-bor.publicnode.com",
    ],
    chainTag: "polygon",
    name: "Mumbai Polygon Testnet",
    nativeCurrency: {
      symbol: "MATIC",
      name: "MATIC",
      decimals: 18,
    },
    explorerUrls: ["https://mumbai.polygonscan.com/"],
    explorerApiUrl: "https://api-testnet.polygonscan.com/api",
    faucetUrls: ["https://faucet.polygon.technology/"],
    infoUrl: "https://polygon.technology/",
  },
];
