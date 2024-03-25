import { Network } from "core/types";

export const ZKSYNCERA: Network[] = [
  // Mainnet
  {
    chainId: 324,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.era.zksync.io",
      "https://zksync.meowrpc.com",
      "https://zksync.drpc.org",
    ],
    chainTag: "zksyncera",
    name: "zkSync Era",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://explorer.zksync.io"],
    faucetUrls: [],
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.zksync.io/" }],
    },
    infoUrl: "https://era.zksync.io",
  },
];
