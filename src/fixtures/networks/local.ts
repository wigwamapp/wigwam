import { Network } from "core/types";

export const LOCAL: Network[] = [
  // Testnets
  {
    chainId: 1337,
    type: "testnet",
    rpcUrls: ["http://localhost:8545"],
    chainTag: "local",
    name: "Local testnet 8545",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
  },
];
