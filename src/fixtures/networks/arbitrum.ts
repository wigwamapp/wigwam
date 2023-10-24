import { Network } from "core/types";

export const ARBITRUM: Network[] = [
  // Mainnet
  {
    chainId: 42161,
    type: "mainnet",
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://endpoints.omniatech.io/v1/arbitrum/one/public",
      "https://1rpc.io/arb",
      "https://arbitrum.llamarpc.com",
      "https://arbitrum.meowrpc.com",
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
    chainId: 421613,
    type: "testnet",
    rpcUrls: [
      "https://arbitrum-goerli.publicnode.com",
      "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
    ],
    chainTag: "arbitrum",
    name: "Goerli Arbitrum Testnet",
    nativeCurrency: {
      symbol: "ARETH",
      name: "Arbitrum Goerli Ether",
      decimals: 18,
    },
    explorerUrls: ["https://goerli.arbiscan.io"],
    explorerApiUrl: "https://api-goerli.arbiscan.io/api",
    faucetUrls: ["https://faucet.quicknode.com/arbitrum/goerli"],
    parent: {
      type: "L2",
      chain: "eip155-4",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
    infoUrl: "https://arbitrum.io",
  },

  {
    chainId: 421614,
    type: "testnet",
    rpcUrls: [
      "https://sepolia-rollup.arbitrum.io/rpc",
      "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
    ],
    chainTag: "arbitrum",
    name: "Sepolia Arbitrum Testnet",
    nativeCurrency: {
      symbol: "ARETH",
      name: "Arbitrum Sepolia Ether",
      decimals: 18,
    },
    explorerUrls: [
      "https://sepolia.arbiscan.io",
      "https://sepolia-explorer.arbitrum.io",
    ],
    faucetUrls: ["https://faucet.quicknode.com/arbitrum/sepolia"],
    parent: {
      type: "L2",
      chain: "eip155-4",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
    infoUrl: "https://arbitrum.io",
  },
];
