import { Network } from "core/types";

export const UNICHAIN: Network[] = [
  // Mainnet
  {
    chainId: 130,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.unichain.org",
      "https://unichain-rpc.publicnode.com",
      "https://unichain.drpc.org",
      "https://unichain.api.onfinality.io/public",
      "https://unichain-mainnet.rpc.sentio.xyz",
    ],
    chainTag: "unichain",
    name: "Unichain",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    explorerUrls: ["https://uniscan.xyz", "https://unichain.blockscout.com"],
    explorerApiUrl: "https://unichain.blockscout.com/api",
    faucetUrls: [],
    infoUrl: "https://unichain.org",
  },
];
