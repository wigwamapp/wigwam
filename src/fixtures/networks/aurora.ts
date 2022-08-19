import { Network } from "core/types";

export const AURORA: Network[] = [
  // Mainnet
  {
    chainId: 1313161554,
    type: "mainnet",
    rpcUrls: ["https://mainnet.aurora.dev"],
    chainTag: "aurora",
    name: "Aurora",
    nativeCurrency: {
      symbol: "AETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://aurorascan.dev"],
    explorerApiUrl: "https://api.aurorascan.dev/api",
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://aurora.dev",
  },

  // Testnets
  {
    chainId: 1313161555,
    type: "testnet",
    rpcUrls: ["https://testnet.aurora.dev"],
    chainTag: "aurora",
    name: "Aurora Testnet",
    nativeCurrency: {
      name: "Ether Test",
      symbol: "TETH",
      decimals: 18,
    },
    explorerUrls: ["https://testnet.aurorascan.dev"],
    explorerApiUrl: "https://api-testnet.aurorascan.dev/api",
    faucetUrls: ["https://aurora.dev/faucet"],
    infoUrl: "https://aurora.dev",
  },
];
