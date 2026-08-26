import { Network } from "core/types";

export const OPTIMISM: Network[] = [
  // Mainnet
  {
    chainId: 10,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.optimism.io",
      "https://1rpc.io/op",
      "https://optimism.publicnode.com",
      "https://public.1rpc.io/op",
      "https://optimism-rpc.publicnode.com",
      "https://optimism.drpc.org",
      "https://op.api.pocket.network",
      "https://public-op-mainnet.fastnode.io",
    ],
    chainTag: "optimism",
    name: "OP Mainnet",
    nativeCurrency: {
      symbol: "OETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://optimistic.etherscan.io"],
    explorerApiUrl: "https://explorer.optimism.io/api",
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },
];
