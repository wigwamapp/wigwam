import { Network } from "core/types";

export const POLYGON: Network[] = [
  // Mainnet
  {
    chainId: 137,
    type: "mainnet",
    rpcUrls: [
      "https://polygon-rpc.com",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://rpc.ankr.com/polygon",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
      "https://poly-rpc.gateway.pokt.network",
      "https://polygon-mainnet.public.blastapi.io",
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
      "https://matic-mumbai.chainstacklabs.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
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
