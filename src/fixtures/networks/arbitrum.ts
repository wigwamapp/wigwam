import { Network } from "core/types";

export const ARBITRUM: Network[] = [
  // Mainnet
  {
    chainId: 42161,
    type: "mainnet",
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
    chainTag: "arbitrum",
    name: "Arbitrum",
    nativeCurrency: {
      symbol: "AETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://arbiscan.io", "https://explorer.arbitrum.io"],
    faucetUrls: [],
    infoUrl: "https://arbitrum.io",
  },

  // Testnets
  {
    chainId: 421611,
    type: "testnet",
    rpcUrls: ["https://rinkeby.arbitrum.io/rpc"],
    chainTag: "arbitrum",
    name: "Arbitrum Testnet Rinkeby",
    nativeCurrency: {
      symbol: "ARETH",
      name: "Arbitrum Rinkeby Ether",
      decimals: 18,
    },
    explorerUrls: ["https://rinkeby-explorer.arbitrum.io"],
    faucetUrls: [],
    infoUrl: "https://arbitrum.io",
  },
];
