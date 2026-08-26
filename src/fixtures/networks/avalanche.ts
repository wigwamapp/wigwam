import { Network } from "core/types";

export const AVALANCHE: Network[] = [
  // Mainnet
  {
    chainId: 43114,
    type: "mainnet",
    rpcUrls: [
      "https://api.avax.network/ext/bc/C/rpc",
      "https://1rpc.io/avax/c",
      "https://avalanche-c-chain.publicnode.com	",
      "https://avalanche.drpc.org",
      "https://avalanche-c-chain-rpc.publicnode.com",
      "https://public.1rpc.io/avax/c",
      "https://avax.api.pocket.network",
      "https://avalanche.api.onfinality.io/public/ext/bc/C/rpc",
    ],
    chainTag: "avalanche",
    name: "Avalanche",
    nativeCurrency: {
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
    },
    explorerUrls: [
      "https://snowtrace.io",
      "https://cchain.explorer.avax.network",
    ],
    explorerApiUrl:
      "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api",
    faucetUrls: [],
    infoUrl: "https://www.avax.network/",
  },
];
