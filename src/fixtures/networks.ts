import { INetwork } from "core/repo";

export const DEFAULT_NETWORKS: INetwork[] = [
  // Ethereum
  {
    chainId: 1,
    rpcUrls: [
      "https://cloudflare-eth.com/",
      "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/",
    ],
    mainnet: true,
    name: "Ethereum Mainnet",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  {
    chainId: 3,
    rpcUrls: ["https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/"],
    mainnet: false,
    name: "Ropsten Test Network",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    blockExplorerUrls: ["https://ropsten.etherscan.io"],
  },
  {
    chainId: 42,
    rpcUrls: ["https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/"],
    mainnet: false,
    name: "Kovan Test Network",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    blockExplorerUrls: ["https://kovan.etherscan.io"],
  },

  // Binance Smart Chain
  {
    chainId: 56,
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    mainnet: true,
    name: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      symbol: "BNB",
      name: "Binance Coin",
      decimals: 18,
    },
    blockExplorerUrls: ["https://bscscan.com"],
  },
  {
    chainId: 97,
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    mainnet: false,
    name: "Binance Smart Chain Testnet",
    nativeCurrency: {
      symbol: "BNB",
      name: "Binance Coin",
      decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },

  // Huobi Eco Chain
  {
    chainId: 128,
    rpcUrls: ["https://http-mainnet.hecochain.com/"],
    mainnet: true,
    name: "Huobi Eco Chain Mainnet",
    nativeCurrency: {
      symbol: "HT",
      name: "Binance Coin",
      decimals: 18,
    },
    blockExplorerUrls: ["https://scan.hecochain.com"],
  },
  {
    chainId: 256,
    rpcUrls: ["https://http-testnet.hecochain.com/"],
    mainnet: false,
    name: "Huobi Eco Chain Test",
    nativeCurrency: {
      symbol: "HT",
      name: "Huobi Token",
      decimals: 18,
    },
    blockExplorerUrls: ["https://scan-testnet.hecochain.com"],
  },
];

export const INITIAL_NETWORK = DEFAULT_NETWORKS[0]; // Ethereum
