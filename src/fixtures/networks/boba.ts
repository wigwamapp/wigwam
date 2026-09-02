import { Network } from "core/types";

export const BOBA: Network[] = [
  // Mainnet
  {
    chainId: 288,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.boba.network",
      "https://public.1rpc.io/boba/eth",
      "https://boba-eth.drpc.org",
      "https://boba-ethereum.gateway.tenderly.co",
      "https://gateway.tenderly.co/public/boba-ethereum",
    ],
    chainTag: "boba",
    name: "Boba Network",
    nativeCurrency: {
      symbol: "BOBA",
      name: "Boba Network",
      decimals: 18,
    },
    explorerUrls: ["https://blockexplorer.boba.network"],
    faucetUrls: [],
    infoUrl: "https://boba.network",
  },
];
