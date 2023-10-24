import { Network } from "core/types";

export const OPTIMISM: Network[] = [
  // Mainnet
  {
    chainId: 10,
    type: "mainnet",
    rpcUrls: [
      "https://optimism.llamarpc.com",
      "https://mainnet.optimism.io",
      "https://1rpc.io/op",
      "https://endpoints.omniatech.io/v1/op/mainnet/public",
      "https://optimism.publicnode.com",
    ],
    chainTag: "optimism",
    name: "OP Mainnet",
    nativeCurrency: {
      symbol: "OETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://optimistic.etherscan.io"],
    explorerApiUrl: "https://api-optimistic.etherscan.io/api",
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },

  // Testnets
  {
    chainId: 420,
    type: "testnet",
    rpcUrls: [
      "https://goerli.optimism.io",
      "https://endpoints.omniatech.io/v1/op/goerli/public",
    ],
    chainTag: "optimism",
    name: "Optimism Testnet Goerli",
    nativeCurrency: {
      symbol: "GOR",
      name: "Goerli Ether",
      decimals: 18,
    },
    explorerUrls: ["https://goerli-optimism.etherscan.io/"],
    explorerApiUrl: "https://api-goerli-optimism.etherscan.io/api",
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },
];
