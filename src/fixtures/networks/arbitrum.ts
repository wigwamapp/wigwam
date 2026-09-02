import { Network } from "core/types";

export const ARBITRUM: Network[] = [
  // Mainnet
  {
    chainId: 42161,
    type: "mainnet",
    rpcUrls: [
      "https://arbitrum-one-rpc.publicnode.com",
      "https://arbitrum.drpc.org",
      "https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}",
      "https://arb1.arbitrum.io/rpc",
      "https://1rpc.io/arb",
      "https://arbitrum.meowrpc.com",
      "https://public.1rpc.io/arb",
      "https://arb-one.api.pocket.network",
    ],
    chainTag: "arbitrum",
    name: "Arbitrum One",
    nativeCurrency: {
      symbol: "AETH",
      name: "Ether",
      decimals: 18,
    },
    explorerUrls: ["https://arbiscan.io", "https://explorer.arbitrum.io"],
    explorerApiUrl: "https://arbitrum.blockscout.com/api",
    faucetUrls: [],
    parent: {
      type: "L2",
      chain: "eip155-1",
      bridges: [{ url: "https://bridge.arbitrum.io" }],
    },
    infoUrl: "https://arbitrum.io",
  },
];
