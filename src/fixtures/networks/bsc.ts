import { Network } from "core/types";

export const BSC: Network[] = [
  // Mainnet
  {
    chainId: 56,
    type: "mainnet",
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed.bnbchain.org",
      "https://1rpc.io/bnb",
      "https://bsc.publicnode.com",
      "https://bsc.drpc.org",
      "https://bsc.meowrpc.com",
      "https://bsc-dataseed.binance.org",
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
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=56",
    faucetUrls: [],
    infoUrl: "https://www.binance.org",
  },
];
