import { Network } from "core/types";

export const MANTLE: Network[] = [
  // Mainnet
  {
    chainId: 5000,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.mantle.xyz",
      "https://mantle.drpc.org",
      "https://mantle.publicnode.com",
      "https://mantle-rpc.publicnode.com",
      "https://public.1rpc.io/mantle",
      "https://mantle.api.pocket.network",
      "https://mantle-public.nodies.app",
      "https://mantle.api.onfinality.io/public",
    ],
    chainTag: "mantle",
    name: "Mantle",
    nativeCurrency: {
      symbol: "MNT",
      name: "Mantle",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.mantle.xyz"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=5000",
    infoUrl: "https://mantle.xyz",
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.mantle.xyz" }],
    },
    faucetUrls: [],
  },
];
