import { Network } from "core/types";

export const INK: Network[] = [
  // Mainnet
  {
    chainId: 57073,
    type: "mainnet",
    rpcUrls: [
      "https://rpc-gel.inkonchain.com",
      "https://rpc-qnd.inkonchain.com",
      "https://ink.drpc.org",
      "https://ink.api.pocket.network",
    ],
    chainTag: "ink",
    name: "Ink",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.inkonchain.com"],
    explorerApiUrl: "https://explorer.inkonchain.com/api",
    faucetUrls: [],
    infoUrl: "https://inkonchain.com",
  },
];
