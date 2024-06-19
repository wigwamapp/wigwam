import { Network } from "core/types";

export const ROOTSTOCK: Network[] = [
  // Mainnet
  {
    chainId: 30,
    type: "mainnet",
    rpcUrls: ["https://public-node.rsk.co", "https://mycrypto.rsk.co"],
    chainTag: "rootstock",
    name: "Rootstock",
    nativeCurrency: {
      symbol: "RBTC",
      name: "Rootstock Bitcoin",
      decimals: 18,
    },
    explorerUrls: [
      "https://explorer.rootstock.io",
      "https://rootstock.blockscout.com",
    ],
    explorerApiUrl: "https://rootstock.blockscout.com/api/v2",
    faucetUrls: [],
    infoUrl: "https://rootstock.io",
  },
];
