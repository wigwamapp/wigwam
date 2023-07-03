import { Network } from "core/types";

export const ARBITRUMNOVA: Network[] = [
  // Mainnet
  {
    chainId: 42170,
    type: "mainnet",
    rpcUrls: ["https://nova.arbitrum.io/rpc"],
    chainTag: "arbitrumnova",
    name: "Arbitrum Nova",
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://nova-explorer.arbitrum.io"],
    iconUrls: [],
    faucetUrls: [],
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
    infoUrl: "https://nova.arbitrum.io/",
  },
];
