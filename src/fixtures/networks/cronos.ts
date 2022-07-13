import { Network } from "core/types";

export const CRONOS: Network[] = [
  // Mainnet
  {
    chainId: 25,
    type: "mainnet",
    rpcUrls: ["https://evm.cronos.org", "https://cronosrpc-1.xstaking.sg"],
    chainTag: "cronos",
    name: "Cronos",
    nativeCurrency: {
      symbol: "CRO",
      name: "Cronos",
      decimals: 18,
    },
    explorerUrls: ["https://cronos.org/explorer"],
    explorerApiUrl: "https://cronos.org/explorer/api",
    faucetUrls: [],
    infoUrl: "https://cronos.org",
  },

  // Testnets
  {
    chainId: 338,
    type: "testnet",
    rpcUrls: [
      "https://evm-t3.cronos.org",
      "https://cronos-testnet-3.crypto.org:8545",
    ],
    chainTag: "cronos",
    name: "Cronos Testnet",
    nativeCurrency: {
      symbol: "TCRO",
      name: "Test Cronos",
      decimals: 18,
    },
    explorerUrls: ["https://cronos.crypto.org/explorer/testnet3"],
    explorerApiUrl: "https://cronos.org/explorer/testnet3/api",
    faucetUrls: ["https://cronos.org/faucet"],
    infoUrl: "https://cronos.org/",
  },
];
