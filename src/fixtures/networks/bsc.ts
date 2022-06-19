import { Network } from "core/types";

export const BSC: Network[] = [
  // Mainnet
  {
    chainId: 56,
    type: "mainnet",
    rpcUrls: [
      "https://bscrpc.com",
      "https://rpc-bsc.bnb48.club",
      "https://binance.nodereal.io",
      "https://rpc.ankr.com/bsc",
      "https://bsc-dataseed.binance.org",
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
    ],
    chainTag: "bsc",
    name: "BNB Smart Chain",
    nativeCurrency: {
      symbol: "BNB",
      name: "Binance Native Token",
      decimals: 18,
    },
    explorerUrls: ["https://bscscan.com"],
    faucetUrls: ["https://free-online-app.com/faucet-for-eth-evm-chains/"],
    infoUrl: "https://www.binance.org",
  },

  // Testnets
  {
    chainId: 97,
    type: "testnet",
    rpcUrls: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://data-seed-prebsc-2-s1.binance.org:8545",
      "https://data-seed-prebsc-1-s2.binance.org:8545",
      "https://data-seed-prebsc-2-s2.binance.org:8545",
      "https://data-seed-prebsc-1-s3.binance.org:8545",
      "https://data-seed-prebsc-2-s3.binance.org:8545",
    ],
    chainTag: "bsc",
    name: "BNB Smart Testnet",
    nativeCurrency: {
      symbol: "tBNB",
      name: "Binance Native Token",
      decimals: 18,
    },
    explorerUrls: ["https://testnet.bscscan.com"],
    faucetUrls: ["https://testnet.binance.org/faucet-smart"],
    infoUrl: "https://testnet.binance.org/",
  },
];
