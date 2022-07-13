import { Network } from "core/types";

export const MOONRIVER: Network[] = [
  // Mainnet
  {
    chainId: 1285,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.api.moonriver.moonbeam.network",
      "https://moonriver.public.blastapi.io",
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
    explorerApiUrl: "https://api-moonriver.moonscan.io/api",
    faucetUrls: [],
    infoUrl: "https://moonbeam.network/networks/moonriver/",
  },
];
