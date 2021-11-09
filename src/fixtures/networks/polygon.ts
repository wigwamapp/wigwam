import { INetwork } from "core/repo";

export const POLYGON: INetwork[] = [
  // Mainnet
  {
    chainId: 137,
    type: "mainnet",
    rpcUrls: [
      "https://polygon-rpc.com/",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
    chainTag: "polygon",
    name: "Polygon",
    nativeCurrency: {
      symbol: "MATIC",
      name: "MATIC",
      decimals: 18,
    },
    explorerUrls: ["https://polygonscan.com/"],
    faucetUrls: [],
    infoUrl: "https://polygon.technology/",
  },

  // Testnets
  {
    chainId: 80001,
    type: "testnet",
    rpcUrls: [
      "https://rpc-mumbai.matic.today",
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
    chainTag: "polygon",
    name: "Polygon Testnet Mumbai",
    nativeCurrency: {
      symbol: "MATIC",
      name: "MATIC",
      decimals: 18,
    },
    explorerUrls: ["https://mumbai.polygonscan.com/"],
    faucetUrls: ["https://faucet.polygon.technology/"],
    infoUrl: "https://polygon.technology/",
  },
];
