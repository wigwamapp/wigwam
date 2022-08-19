import { Network } from "core/types";

export const EVMOS: Network[] = [
  // Mainnet
  {
    chainId: 9001,
    type: "mainnet",
    rpcUrls: [
      "https://eth.bd.evmos.org:8545",
      "https://evmos-mainnet.gateway.pokt.network/v1/lb/627586ddea1b320039c95205",
    ],
    chainTag: "evmos",
    name: "Evmos",
    nativeCurrency: {
      symbol: "EVMOS",
      name: "Evmos",
      decimals: 18,
    },
    explorerUrls: ["https://evm.evmos.org", "https://www.mintscan.io/evmos"],
    explorerApiUrl: "https://evm.evmos.org/api",
    faucetUrls: [],
    infoUrl: "https://evmos.org",
  },

  // Testnets
  {
    chainId: 9000,
    type: "testnet",
    rpcUrls: ["https://eth.bd.evmos.dev:8545"],
    chainTag: "evmos",
    name: "Evmos Testnet",
    nativeCurrency: {
      symbol: "tEVMOS",
      name: "Test Evmos",
      decimals: 18,
    },
    explorerUrls: ["https://evm.evmos.dev", "https://explorer.evmos.dev"],
    explorerApiUrl: "https://evm.evmos.dev/api",
    faucetUrls: ["https://faucet.evmos.dev"],
    infoUrl: "https://evmos.org",
  },
];
