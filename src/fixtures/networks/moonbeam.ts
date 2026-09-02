import { Network } from "core/types";

export const MOONBEAM: Network[] = [
  // Mainnet
  {
    chainId: 1284,
    type: "mainnet",
    rpcUrls: [
      // Dropped: the official "https://rpc.api.moonbeam.network" resolves to a
      // private 10.1.0.10 and "https://moonbeam-rpc.publicnode.com" answers 404
      "https://moonbeam.drpc.org",
      "https://moonbeam.api.pocket.network",
      "https://moonbeam.api.onfinality.io/public",
      "https://public.1rpc.io/glmr",
    ],
    chainTag: "moonbeam",
    name: "Moonbeam",
    nativeCurrency: {
      symbol: "GLMR",
      name: "Glimmer",
      decimals: 18,
    },
    explorerUrls: ["https://moonbeam.moonscan.io"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=1284",
    faucetUrls: [],
    infoUrl: "https://moonbeam.network/networks/moonbeam/",
  },
];
