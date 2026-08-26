import { Network } from "core/types";

export const MOONRIVER: Network[] = [
  // Mainnet
  {
    chainId: 1285,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.api.moonriver.moonbeam.network",
      "https://moonriver.api.onfinality.io/public",
      "https://moonriver-rpc.publicnode.com",
      "https://moonriver.drpc.org",
      "https://moonriver.api.pocket.network",
    ],
    chainTag: "moonriver",
    name: "Moonriver",
    nativeCurrency: {
      symbol: "MOVR",
      name: "Moonriver",
      decimals: 18,
    },
    explorerUrls: ["https://moonriver.moonscan.io"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=1285",
    faucetUrls: [],
    infoUrl: "https://moonbeam.network/networks/moonriver/",
  },
];
