import { Network } from "core/types";

export const KATANA: Network[] = [
  // Mainnet
  {
    chainId: 747474,
    type: "mainnet",
    rpcUrls: [
      "https://rpc.katana.network",
      "https://katana.drpc.org",
      "https://rpc.katanarpc.com",
      "https://katana.rpc.sentio.xyz",
      "https://katana.gateway.tenderly.co",
    ],
    chainTag: "katana",
    name: "Katana",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://katanascan.com", "https://explorer.katanarpc.com"],
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=747474",
    faucetUrls: [],
    infoUrl: "https://katana.network",
  },
];
