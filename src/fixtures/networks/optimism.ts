import { Network } from "core/types";

export const OPTIMISM: Network[] = [
  // Mainnet
  {
    chainId: 10,
    type: "mainnet",
    rpcUrls: ["https://mainnet.optimism.io"],
    chainTag: "optimism",
    name: "Optimism",
    nativeCurrency: {
      symbol: "OETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://optimistic.etherscan.io"],
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },

  // Testnets
  {
    chainId: 69,
    type: "testnet",
    rpcUrls: ["https://kovan.optimism.io"],
    chainTag: "optimism",
    name: "Optimism Testnet Kovan",
    nativeCurrency: {
      symbol: "KOR",
      name: "Kovan Ether",
      decimals: 18,
    },
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },
  {
    chainId: 420,
    type: "testnet",
    rpcUrls: ["https://goerli.optimism.io"],
    chainTag: "optimism",
    name: "Optimism Testnet Goerli",
    nativeCurrency: {
      symbol: "GOR",
      name: "Goerli Ether",
      decimals: 18,
    },
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },
];
