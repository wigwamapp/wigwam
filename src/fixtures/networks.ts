import { INetwork } from "core/repo";

export const DEFAULT_NETWORKS: INetwork[] = [
  // Ethereum
  {
    chainId: 1,
    rpcURLs: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/"],
    main: true,
    name: "Ethereum Mainnet",
    mainAssetSymbol: "ETH",
    mainAssetName: "Ethereum",
    blockExplorerURL: "https://etherscan.io",
  },
  {
    chainId: 3,
    rpcURLs: ["https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/"],
    main: false,
    name: "Ropsten Test Network",
    mainAssetSymbol: "ETH",
    mainAssetName: "Ethereum",
    blockExplorerURL: "https://ropsten.etherscan.io",
  },
  {
    chainId: 42,
    rpcURLs: ["https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161/"],
    main: false,
    name: "Kovan Test Network",
    mainAssetSymbol: "ETH",
    mainAssetName: "Ethereum",
    blockExplorerURL: "https://kovan.etherscan.io",
  },

  // Binance Smart Chain
  {
    chainId: 56,
    rpcURLs: ["https://bsc-dataseed.binance.org/"],
    main: true,
    name: "Binance Smart Chain Mainnet",
    mainAssetSymbol: "BNB",
    mainAssetName: "Binance Coin",
    blockExplorerURL: "https://bscscan.com",
  },
  {
    chainId: 97,
    rpcURLs: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    main: false,
    name: "Binance Smart Chain Testnet",
    mainAssetSymbol: "BNB",
    mainAssetName: "Binance Coin",
    blockExplorerURL: "https://testnet.bscscan.com",
  },

  // Huobi Eco Chain
  {
    chainId: 128,
    rpcURLs: ["https://http-mainnet.hecochain.com/"],
    main: true,
    name: "Huobi Eco Chain Mainnet",
    mainAssetSymbol: "HT",
    mainAssetName: "Binance Coin",
    blockExplorerURL: "https://scan.hecochain.com",
  },
  {
    chainId: 256,
    rpcURLs: ["https://http-testnet.hecochain.com/"],
    main: false,
    name: "Huobi Eco Chain Test",
    mainAssetSymbol: "HT",
    mainAssetName: "Huobi Token",
    blockExplorerURL: "https://scan-testnet.hecochain.com",
  },
];
