import { Network } from "core/types";

export const MANTLE: Network[] = [
  // Mainnet
  {
    chainId: 5000,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.mantle.xyz",
      "https://rpc.ankr.com/mantle",
      "https://mantle.drpc.org",
      "https://mantle.publicnode.com",
      "https://mantle-mainnet.public.blastapi.io",
    ],
    chainTag: "mantle",
    name: "Mantle",
    nativeCurrency: {
      symbol: "MNT",
      name: "Mantle",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.mantle.xyz"],
    explorerApiUrl: "https://explorer.mantle.xyz/api",
    infoUrl: "https://mantle.xyz",
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.mantle.xyz" }],
    },
    faucetUrls: [],
  },
];
