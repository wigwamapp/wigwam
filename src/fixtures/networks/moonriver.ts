import { Network } from "core/types";

export const MOONRIVER: Network[] = [
  // Mainnet
  {
    chainId: 1285,
    type: "mainnet",
    rpcUrls: [
      // Dropped: the official "https://rpc.api.moonriver.moonbeam.network"
      // resolves to a private 10.1.0.10, "https://moonriver-rpc.publicnode.com"
      // answers 404 and "https://moonriver.api.pocket.network" fails every
      // call but eth_chainId
      "https://moonriver.drpc.org",
      "https://moonriver.api.onfinality.io/public",
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
