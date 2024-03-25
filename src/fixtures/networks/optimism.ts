import { Network } from "core/types";

export const OPTIMISM: Network[] = [
  // Mainnet
  {
    chainId: 10,
    type: "mainnet",
    rpcUrls: [
      "https://mainnet.optimism.io",
      "https://optimism.llamarpc.com",
      "https://1rpc.io/op",
      "https://endpoints.omniatech.io/v1/op/mainnet/public",
      "https://optimism.publicnode.com",
    ],
    chainTag: "optimism",
    name: "OP Mainnet",
    nativeCurrency: {
      symbol: "OETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://optimistic.etherscan.io"],
    explorerApiUrl: "https://api-optimistic.etherscan.io/api",
    iconUrls: [],
    faucetUrls: [],
    infoUrl: "https://optimism.io",
  },
];
