import { Network } from "core/types";

export const ARBITRUM: Network[] = [
  // Mainnet
  {
    chainId: 42161,
    type: "mainnet",
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum",
      "https://arbitrum-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
    chainTag: "arbitrum",
    name: "Arbitrum One",
    nativeCurrency: {
      symbol: "AETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://arbiscan.io", "https://explorer.arbitrum.io"],
    explorerApiUrl: "https://api.arbiscan.io/api",
    faucetUrls: [],
    bridgesUrls: ["https://bridge.arbitrum.io"],
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
    explorerUrls: [
      "https://testnet.arbiscan.io",
      "https://rinkeby-explorer.arbitrum.io",
    ],
    explorerApiUrl: "https://api-testnet.arbiscan.io/api",
    faucetUrls: ["https://fauceth.komputing.org/?chain=421611"],
    bridgesUrls: ["https://bridge.arbitrum.io"],
    infoUrl: "https://arbitrum.io",
  },
];
