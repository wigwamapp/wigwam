import { INetwork } from "core/repo";

// Currently taken from
// https://github.com/TP-Lab/networklist-org/blob/main/chains.json

export const DEFAULT_NETWORKS = [
  // Ethereum
  {
    chainId: 1,
    rpcUrls: [
      "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "https://api.mycryptoapi.com/eth",
      "https://cloudflare-eth.com",
    ],
    chain: "ETH",
    mainnet: true,
    name: "Ethereum Mainnet",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://etherscan.io"],
    faucetUrls: [],
    infoUrl: "https://ethereum.org",
  },
  {
    chainId: 3,
    rpcUrls: ["https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    mainnet: false,
    name: "Ethereum Testnet Ropsten",
    nativeCurrency: {
      symbol: "ROP",
      name: "Ropsten Ether",
      decimals: 18,
    },
    explorerUrls: ["https://ropsten.etherscan.io"],
    faucetUrls: ["https://faucet.ropsten.be"],
    infoUrl: "https://github.com/ethereum/ropsten",
  },
  {
    chainId: 42,
    rpcUrls: [
      "https://kovan.poa.network",
      "http://kovan.poa.network:8545",
      "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
    mainnet: false,
    name: "Ethereum Testnet Kovan",
    nativeCurrency: {
      symbol: "KOV",
      name: "Kovan Ether",
      decimals: 18,
    },
    explorerUrls: ["https://kovan.etherscan.io"],
    faucetUrls: [
      "https://faucet.kovan.network",
      "https://gitter.im/kovan-testnet/faucet",
    ],
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
    explorerUrls: ["https://bscscan.com"],
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
    explorerUrls: ["https://testnet.bscscan.com"],
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
    explorerUrls: ["https://scan.hecochain.com"],
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
    explorerUrls: ["https://scan-testnet.hecochain.com"],
  },
];

export const INITIAL_NETWORK = DEFAULT_NETWORKS[0]; // Ethereum
