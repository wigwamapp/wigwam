import { Network } from "core/types";

export const MOONBEAM: Network[] = [
  // Mainnet
  {
    chainId: 1284,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.api.moonbeam.network",
      "https://public.1rpc.io/glmr",
      "https://moonbeam.drpc.org",
      "https://moonbeam-rpc.publicnode.com",
      "https://moonbeam.api.pocket.network",
      "https://moonbeam.api.onfinality.io/public",
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
