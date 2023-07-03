import { Network } from "core/types";

export const ARBITRUM: Network[] = [
  // Mainnet
  {
    chainId: 42161,
    type: "mainnet",
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum",
      "https://1rpc.io/arb",
      "https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}",
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
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
    infoUrl: "https://arbitrum.io",
  },

  // Testnets
  {
    chainId: 421611,
    type: "testnet",
    rpcUrls: ["https://rinkeby.arbitrum.io/rpc"],
    chainTag: "arbitrum",
    name: "Rinkeby Arbitrum Testnet",
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
    parent: {
      type: "L2",
      chain: "eip155-4",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
    infoUrl: "https://arbitrum.io",
  },
];
