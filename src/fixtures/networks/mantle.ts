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

  // Testnets
  {
    chainId: 5001,
    type: "testnet",
    rpcUrls: ["https://rpc.testnet.mantle.xyz"],
    chainTag: "mantle",
    name: "Mantle Testnet",
    nativeCurrency: {
      symbol: "MNT",
      name: "Testnet Mantle",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.testnet.mantle.xyz"],
    explorerApiUrl: "https://explorer.testnet.mantle.xyz/api",
    faucetUrls: ["https://faucet.testnet.mantle.xyz"],
    infoUrl: "https://mantle.xyz",
  },
];
